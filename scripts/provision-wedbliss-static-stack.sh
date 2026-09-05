#!/usr/bin/env bash
# Provision Wedbliss static stack (S3 + ACM + CloudFront OAC) in the current AWS account.
# Buckets: wedbliss-www, wedbliss-template, wedbliss-images (ap-south-1)
# ACM cert for CloudFront aliases must be in us-east-1.
set -euo pipefail

# Unset proxies that break AWS CLI
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy NO_PROXY no_proxy
unset GIT_HTTP_PROXY GIT_HTTPS_PROXY SOCKS_PROXY SOCKS5_PROXY socks_proxy socks5_proxy

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATUS_FILE="${ROOT}/scripts/aws-new-account-resources.json"
ENV_LOCAL="${ROOT}/.env.local"
REGION_S3="ap-south-1"
REGION_ACM="us-east-1"
BUCKET_WWW="wedbliss-www"
BUCKET_TEMPLATE="wedbliss-template"
BUCKET_IMAGES="wedbliss-images"
OAC_NAME="wedbliss-s3-oac"
EC2_HOST="ec2-user@3.111.30.189"
EC2_KEY="${HOME}/.ssh/wedbliss-ec2.pem"
ACM_POLL_MAX_SEC=900

export AWS_EC2_METADATA_DISABLED=true
export AWS_DEFAULT_REGION="${REGION_S3}"

need() { command -v "$1" >/dev/null || { echo "Missing dependency: $1"; exit 1; }; }
need aws
need python3
need curl
need jq || true

echo "==> Identity"
IDENTITY_JSON="$(aws sts get-caller-identity --output json)"
ACCOUNT_ID="$(echo "$IDENTITY_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Account"])')"
IAM_ARN="$(echo "$IDENTITY_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Arn"])')"
echo "Account: $ACCOUNT_ID | $IAM_ARN"

ACM_ARN=""
ACM_STATUS="not_created"
ACM_ERROR=""
BLOCKERS=()

ensure_bucket() {
  local b="$1"
  if aws s3api head-bucket --bucket "$b" 2>/dev/null; then
    echo "Bucket exists: $b"
  else
    echo "Creating bucket: $b"
    aws s3api create-bucket --bucket "$b" --region "$REGION_S3" \
      --create-bucket-configuration LocationConstraint="$REGION_S3"
  fi
  aws s3api put-public-access-block --bucket "$b" --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
}

echo "==> S3 buckets ($REGION_S3)"
ensure_bucket "$BUCKET_WWW"
ensure_bucket "$BUCKET_TEMPLATE"
ensure_bucket "$BUCKET_IMAGES"

echo "==> Images CORS"
aws s3api put-bucket-cors --bucket "$BUCKET_IMAGES" --cors-configuration '{
  "CORSRules": [{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD", "POST"],
    "AllowedOrigins": [
      "https://*.wedbliss.co",
      "https://www.wedbliss.co",
      "https://wedbliss.co",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }]
}'

echo "==> ACM (us-east-1) for wedbliss.co + *.wedbliss.co"
# Reuse unused matching cert if present
EXISTING_CERT="$(aws acm list-certificates --region "$REGION_ACM" --certificate-statuses PENDING_VALIDATION ISSUED \
  --query "CertificateSummaryList[?DomainName=='wedbliss.co'].CertificateArn | [0]" --output text 2>/dev/null || true)"
if [[ -n "${EXISTING_CERT:-}" && "$EXISTING_CERT" != "None" ]]; then
  ACM_ARN="$EXISTING_CERT"
  ACM_STATUS="$(aws acm describe-certificate --certificate-arn "$ACM_ARN" --region "$REGION_ACM" --query 'Certificate.Status' --output text)"
  echo "Reusing ACM cert: $ACM_ARN ($ACM_STATUS)"
else
  set +e
  REQ_OUT="$(aws acm request-certificate \
    --domain-name wedbliss.co \
    --subject-alternative-names '*.wedbliss.co' \
    --validation-method DNS \
    --region "$REGION_ACM" \
    --output json 2>&1)"
  REQ_RC=$?
  set -e
  if [[ $REQ_RC -ne 0 ]]; then
    ACM_ERROR="$REQ_OUT"
    ACM_STATUS="denied"
    BLOCKERS+=("acm:RequestCertificate denied for $IAM_ARN — grant ACM permissions in us-east-1")
    echo "ERROR: ACM request failed: $REQ_OUT"
  else
    ACM_ARN="$(echo "$REQ_OUT" | python3 -c 'import sys,json; print(json.load(sys.stdin)["CertificateArn"])')"
    ACM_STATUS="PENDING_VALIDATION"
    echo "Requested ACM: $ACM_ARN"
  fi
fi

# Cloudflare DNS validation if we have a pending cert + tokens
if [[ -n "$ACM_ARN" && -f "$ENV_LOCAL" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_LOCAL"; set +a
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" && -n "${CLOUDFLARE_ZONE_ID:-}" ]]; then
    echo "==> Cloudflare ACM DNS validation CNAMEs (proxied:false)"
    sleep 3
    python3 - <<PY
import json, os, subprocess, urllib.request

arn = os.environ.get("ACM_ARN") or "${ACM_ARN}"
region = "${REGION_ACM}"
token = os.environ["CLOUDFLARE_API_TOKEN"]
zone = os.environ["CLOUDFLARE_ZONE_ID"]

desc = subprocess.check_output([
  "aws", "acm", "describe-certificate",
  "--certificate-arn", arn, "--region", region, "--output", "json"
], text=True)
cert = json.loads(desc)["Certificate"]
records = {}
for dvo in cert.get("DomainValidationOptions", []):
    rr = dvo.get("ResourceRecord") or {}
    if rr.get("Name") and rr.get("Value"):
        records[rr["Name"].rstrip(".")] = rr["Value"].rstrip(".")

def cf(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4{path}",
        data=data, method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

for name, content in records.items():
    # relative name under zone
    rel = name
    if rel.endswith(".wedbliss.co"):
        rel = rel[: -len(".wedbliss.co")]
    if rel == "wedbliss.co":
        rel = "@"
    listed = cf("GET", f"/zones/{zone}/dns_records?type=CNAME&name={name}")
    existing = listed.get("result") or []
    payload = {"type": "CNAME", "name": name, "content": content, "proxied": False, "ttl": 120}
    if existing:
        rid = existing[0]["id"]
        cf("PUT", f"/zones/{zone}/dns_records/{rid}", payload)
        print(f"Updated CNAME {name} -> {content}")
    else:
        cf("POST", f"/zones/{zone}/dns_records", payload)
        print(f"Created CNAME {name} -> {content}")
PY
    echo "==> Polling ACM until ISSUED (max ${ACM_POLL_MAX_SEC}s)"
    deadline=$((SECONDS + ACM_POLL_MAX_SEC))
    while (( SECONDS < deadline )); do
      ACM_STATUS="$(aws acm describe-certificate --certificate-arn "$ACM_ARN" --region "$REGION_ACM" --query 'Certificate.Status' --output text)"
      echo "  ACM status: $ACM_STATUS"
      [[ "$ACM_STATUS" == "ISSUED" ]] && break
      sleep 20
    done
    if [[ "$ACM_STATUS" != "ISSUED" ]]; then
      BLOCKERS+=("ACM certificate not ISSUED within ${ACM_POLL_MAX_SEC}s (status=$ACM_STATUS)")
    fi
  else
    echo "WARN: CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID missing in .env.local — skip DNS validation"
  fi
fi

echo "==> Origin Access Control"
OAC_ID="$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id | [0]" --output text 2>/dev/null || true)"
if [[ -z "$OAC_ID" || "$OAC_ID" == "None" ]]; then
  OAC_ID="$(aws cloudfront create-origin-access-control --origin-access-control-config "{
    \"Name\": \"${OAC_NAME}\",
    \"Description\": \"Wedbliss shared OAC for www and template S3 origins\",
    \"SigningProtocol\": \"sigv4\",
    \"SigningBehavior\": \"always\",
    \"OriginAccessControlOriginType\": \"s3\"
  }" --query 'OriginAccessControl.Id' --output text)"
  echo "Created OAC: $OAC_ID"
else
  echo "Reusing OAC: $OAC_ID"
fi

find_dist_by_comment() {
  local comment="$1"
  aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='${comment}'].Id | [0]" --output text 2>/dev/null || true
}

find_dist_by_alias() {
  local alias="$1"
  aws cloudfront list-distributions --output json | python3 -c "
import sys, json
alias = sys.argv[1]
data = json.load(sys.stdin)
items = (data.get('DistributionList') or {}).get('Items') or []
for d in items:
    aliases = (d.get('Aliases') or {}).get('Items') or []
    if alias in aliases:
        print(d['Id']); break
" "$alias" 2>/dev/null || true
}

create_or_get_dist() {
  local kind="$1" bucket="$2" comment="$3"
  shift 3
  local aliases=("$@")
  local existing=""
  for a in "${aliases[@]}"; do
    existing="$(find_dist_by_alias "$a")"
    [[ -n "$existing" ]] && break
  done
  if [[ -z "$existing" ]]; then
    existing="$(find_dist_by_comment "$comment")"
  fi
  if [[ -n "$existing" && "$existing" != "None" ]]; then
    echo "Reusing $kind distribution: $existing" >&2
    aws cloudfront get-distribution --id "$existing" --output json
    return
  fi

  local caller_ref="${comment}-$(date +%s)"
  local alias_qty=${#aliases[@]}
  local alias_items="[]"
  local viewer_cert
  if [[ "$ACM_STATUS" == "ISSUED" && -n "$ACM_ARN" && $alias_qty -gt 0 ]]; then
    alias_items="$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1:]))' "${aliases[@]}")"
    viewer_cert="$(python3 -c "import json; print(json.dumps({
      'ACMCertificateArn': '''$ACM_ARN''',
      'SSLSupportMethod': 'sni-only',
      'MinimumProtocolVersion': 'TLSv1.2_2021',
      'Certificate': '''$ACM_ARN''',
      'CertificateSource': 'acm'
    }))")"
  else
    alias_qty=0
    alias_items="[]"
    viewer_cert='{"CloudFrontDefaultCertificate": true, "MinimumProtocolVersion": "TLSv1.2_2021"}'
    if [[ "$ACM_STATUS" != "ISSUED" ]]; then
      echo "WARN: Creating $kind CF without aliases (ACM not ISSUED)" >&2
    fi
  fi

  python3 - "$caller_ref" "$comment" "$bucket" "$REGION_S3" "$OAC_ID" "$alias_qty" "$alias_items" "$viewer_cert" <<'PY' > /tmp/cf-dist-config.json
import json, sys
caller, comment, bucket, region, oac, alias_qty, alias_items, viewer = sys.argv[1:9]
aliases = json.loads(alias_items)
viewer = json.loads(viewer)
origin_id = f"S3-{bucket}"
cfg = {
  "CallerReference": caller,
  "Comment": comment,
  "Enabled": True,
  "DefaultRootObject": "index.html",
  "PriceClass": "PriceClass_100",
  "Aliases": {"Quantity": int(alias_qty), "Items": aliases} if int(alias_qty) else {"Quantity": 0},
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": origin_id,
      "DomainName": f"{bucket}.s3.{region}.amazonaws.com",
      "OriginAccessControlId": oac,
      "S3OriginConfig": {"OriginAccessIdentity": ""},
    }],
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": origin_id,
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
    },
    "Compress": True,
    "ForwardedValues": {"QueryString": False, "Cookies": {"Forward": "none"}},
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0},
      {"ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0},
    ],
  },
  "ViewerCertificate": viewer,
  "HttpVersion": "http2",
  "IsIPV6Enabled": True,
}
json.dump({"DistributionConfig": cfg}, sys.stdout)
PY
  # create-distribution wants DistributionConfig as root of --distribution-config
  python3 -c 'import json; d=json.load(open("/tmp/cf-dist-config.json")); json.dump(d["DistributionConfig"], open("/tmp/cf-dist-only.json","w"))'
  aws cloudfront create-distribution --distribution-config file:///tmp/cf-dist-only.json --output json
}

echo "==> CloudFront landing"
LANDING_JSON="$(create_or_get_dist landing "$BUCKET_WWW" "wedbliss-landing www+apex" www.wedbliss.co wedbliss.co)"
LANDING_ID="$(echo "$LANDING_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Distribution"]["Id"])')"
LANDING_DOMAIN="$(echo "$LANDING_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Distribution"]["DomainName"])')"
echo "Landing: $LANDING_ID $LANDING_DOMAIN"

echo "==> CloudFront template"
TEMPLATE_JSON="$(create_or_get_dist template "$BUCKET_TEMPLATE" "wedbliss-template SPA" template.wedbliss.co)"
TEMPLATE_ID="$(echo "$TEMPLATE_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Distribution"]["Id"])')"
TEMPLATE_DOMAIN="$(echo "$TEMPLATE_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["Distribution"]["DomainName"])')"
echo "Template: $TEMPLATE_ID $TEMPLATE_DOMAIN"

# If ACM issued later and dists lack aliases, update them
if [[ "$ACM_STATUS" == "ISSUED" && -n "$ACM_ARN" ]]; then
  echo "==> Ensuring aliases on distributions"
  python3 - <<PY
import json, subprocess, sys

def ensure_aliases(dist_id, aliases, acm_arn):
    raw = subprocess.check_output(["aws", "cloudfront", "get-distribution-config", "--id", dist_id, "--output", "json"], text=True)
    data = json.loads(raw)
    etag = data["ETag"]
    cfg = data["DistributionConfig"]
    current = (cfg.get("Aliases") or {}).get("Items") or []
    need = [a for a in aliases if a not in current]
    if not need and cfg.get("ViewerCertificate", {}).get("ACMCertificateArn") == acm_arn:
        print(f"{dist_id}: aliases OK")
        return
    cfg["Aliases"] = {"Quantity": len(aliases), "Items": aliases}
    cfg["ViewerCertificate"] = {
        "ACMCertificateArn": acm_arn,
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021",
        "Certificate": acm_arn,
        "CertificateSource": "acm",
    }
    path = f"/tmp/cf-update-{dist_id}.json"
    with open(path, "w") as f:
        json.dump(cfg, f)
    subprocess.check_call([
        "aws", "cloudfront", "update-distribution",
        "--id", dist_id, "--if-match", etag,
        "--distribution-config", f"file://{path}",
    ])
    print(f"{dist_id}: updated aliases {aliases}")

ensure_aliases("${LANDING_ID}", ["www.wedbliss.co", "wedbliss.co"], "${ACM_ARN}")
ensure_aliases("${TEMPLATE_ID}", ["template.wedbliss.co"], "${ACM_ARN}")
PY
fi

echo "==> S3 bucket policies (OAC GetObject)"
put_policy() {
  local bucket="$1" dist_id="$2"
  cat > "/tmp/policy-${bucket}.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipalReadOnly",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${bucket}/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${dist_id}"
      }
    }
  }]
}
EOF
  aws s3api put-bucket-policy --bucket "$bucket" --policy "file:///tmp/policy-${bucket}.json"
}
put_policy "$BUCKET_WWW" "$LANDING_ID"
put_policy "$BUCKET_TEMPLATE" "$TEMPLATE_ID"

EC2_OK="skipped"
EC2_DETAIL=""
if [[ -f "$EC2_KEY" ]]; then
  echo "==> Update EC2 env + pm2 restart"
  set +e
  ssh -i "$EC2_KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20 "$EC2_HOST" \
    LANDING_ID="$LANDING_ID" TEMPLATE_ID="$TEMPLATE_ID" TEMPLATE_DOMAIN="$TEMPLATE_DOMAIN" \
    bash <<'REMOTE'
set -euo pipefail
python3 - <<'PY'
import os, re
keys = {
  "AWS_REGION": "ap-south-1",
  "AWS_S3_REGION": "ap-south-1",
  "AWS_S3_BUCKET_NAME": "wedbliss-images",
  "CLOUDFRONT_DISTRIBUTION_ID": os.environ["TEMPLATE_ID"],
  "LANDING_CF_DISTRIBUTION_ID": os.environ["LANDING_ID"],
  "TEMPLATE_CF_DISTRIBUTION_ID": os.environ["TEMPLATE_ID"],
  "TEMPLATE_CF_DOMAIN": os.environ["TEMPLATE_DOMAIN"],
}
for path in ["/home/ec2-user/wedbliss/.env.local", "/home/ec2-user/wedbliss/backend/.env"]:
    try:
        with open(path) as fh:
            lines = fh.read().splitlines()
    except FileNotFoundError:
        lines = []
    seen = set()
    out = []
    for line in lines:
        m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)=(.*)$', line)
        if m and m.group(1) in keys:
            out.append(f"{m.group(1)}={keys[m.group(1)]}")
            seen.add(m.group(1))
        else:
            out.append(line)
    for k, v in keys.items():
        if k not in seen:
            out.append(f"{k}={v}")
    with open(path, "w") as fh:
        fh.write("\n".join(out) + "\n")
    print("updated", path)
PY
pm2 restart wedbliss-api --update-env
sleep 2
curl -sS http://127.0.0.1:4000/health
echo
REMOTE
  EC2_RC=$?
  set -e
  if [[ $EC2_RC -eq 0 ]]; then
    EC2_OK="ok"
    EC2_DETAIL="Updated .env.local + backend/.env; pm2 restart wedbliss-api; health ok"
  else
    EC2_OK="failed"
    EC2_DETAIL="ssh/update failed rc=$EC2_RC"
    BLOCKERS+=("EC2 env update failed")
  fi
else
  EC2_DETAIL="Missing key $EC2_KEY"
fi

ALIASES_PENDING="true"
[[ "$ACM_STATUS" == "ISSUED" ]] && ALIASES_PENDING="false"

python3 - <<PY > "$STATUS_FILE"
import json
status = {
  "account_id": "${ACCOUNT_ID}",
  "iam_arn": "${IAM_ARN}",
  "region_s3": "${REGION_S3}",
  "region_acm_cloudfront_cert": "${REGION_ACM}",
  "status": "partial" if ${#BLOCKERS[@]} else "ready",
  "buckets": {
    "wedbliss-www": {"region": "${REGION_S3}", "status": "created", "purpose": "landing static site"},
    "wedbliss-template": {"region": "${REGION_S3}", "status": "created", "purpose": "invitation template engine"},
    "wedbliss-images": {"region": "${REGION_S3}", "status": "created", "purpose": "uploads", "cors": True},
  },
  "oac": {"id": "${OAC_ID}", "name": "${OAC_NAME}"},
  "acm": {
    "arn": "${ACM_ARN}" or None,
    "status": "${ACM_STATUS}",
    "domains": ["wedbliss.co", "*.wedbliss.co"],
    "error": """${ACM_ERROR}""" or None,
  },
  "cloudfront": {
    "landing": {
      "id": "${LANDING_ID}",
      "domain": "${LANDING_DOMAIN}",
      "aliases_desired": ["www.wedbliss.co", "wedbliss.co"],
      "aliases_attached": not (${ALIASES_PENDING} == True),
      "comment": "wedbliss-landing www+apex",
    },
    "template": {
      "id": "${TEMPLATE_ID}",
      "domain": "${TEMPLATE_DOMAIN}",
      "aliases_desired": ["template.wedbliss.co"],
      "aliases_attached": not (${ALIASES_PENDING} == True),
      "comment": "wedbliss-template SPA",
    },
  },
  "suggested_cloudflare_dns_cutover": [
    {"type": "CNAME", "name": "www", "content": "${LANDING_DOMAIN}", "proxied": False, "note": "requires landing CF aliases + ACM ISSUED"},
    {"type": "CNAME", "name": "@", "content": "${LANDING_DOMAIN}", "proxied": False, "note": "CNAME flattening; requires ACM + aliases"},
    {"type": "CNAME", "name": "template", "content": "${TEMPLATE_DOMAIN}", "proxied": False, "note": "requires template CF alias + ACM ISSUED"},
    {"type": "A", "name": "api", "content": "3.111.30.189", "proxied": True},
  ],
  "ec2_env_update": {
    "host": "3.111.30.189",
    "status": "${EC2_OK}",
    "detail": """${EC2_DETAIL}""",
  },
  "blockers": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1:]))' "${BLOCKERS[@]:-}"),
  "next_steps": [
    "Attach acm:RequestCertificate (and Describe/List) to cursor_cli in us-east-1",
    "Re-run scripts/provision-wedbliss-static-stack.sh to request cert, validate via Cloudflare, attach CF aliases",
    "Then point Cloudflare www/@/template CNAMEs at the CloudFront domains",
  ],
}
# clean empty blocker
if status["blockers"] == [""]:
    status["blockers"] = []
print(json.dumps(status, indent=2))
PY

echo "==> Wrote $STATUS_FILE"
echo "DONE account=$ACCOUNT_ID landing=$LANDING_ID template=$TEMPLATE_ID acm=$ACM_STATUS"
