#!/usr/bin/env bash
# Create a basic Wedbliss API EC2 instance in ap-south-1 and print the public IP.
set -euo pipefail

REGION="ap-south-1"
INSTANCE_TYPE="t3.micro"
KEY_NAME="wedbliss-ec2"
SG_NAME="wedbliss-api-sg"
INSTANCE_NAME="wedbliss-api"
KEY_PATH="${HOME}/.ssh/${KEY_NAME}.pem"

export AWS_DEFAULT_REGION="$REGION"
export AWS_EC2_METADATA_DISABLED=true

echo "==> Verifying AWS identity..."
aws sts get-caller-identity
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
echo "Account: $ACCOUNT_ID | Region: $REGION"

echo "==> Resolving Amazon Linux 2023 AMI..."
AMI_ID="$(aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query 'Parameters[0].Value' \
  --output text)"
echo "AMI: $AMI_ID"

echo "==> Ensuring key pair exists..."
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
  echo "Key pair '$KEY_NAME' already exists in AWS."
  if [[ ! -f "$KEY_PATH" ]]; then
    echo "WARNING: Local private key missing at $KEY_PATH"
    echo "If you lost the .pem, delete the key pair in AWS and re-run this script."
  fi
else
  mkdir -p "$(dirname "$KEY_PATH")"
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" \
    --query 'KeyMaterial' \
    --output text > "$KEY_PATH"
  chmod 400 "$KEY_PATH"
  echo "Created key pair and saved private key to $KEY_PATH"
fi

echo "==> Ensuring security group exists..."
VPC_ID="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)"
if [[ -z "$VPC_ID" || "$VPC_ID" == "None" ]]; then
  echo "ERROR: No default VPC found in $REGION. Create a VPC first."
  exit 1
fi
echo "Default VPC: $VPC_ID"

SG_ID="$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || true)"

if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  SG_ID="$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "Wedbliss API (SSH/HTTP/HTTPS)" \
    --vpc-id "$VPC_ID" \
    --query 'GroupId' \
    --output text)"
  echo "Created security group: $SG_ID"

  MY_IP="$(curl -sS --connect-timeout 5 https://checkip.amazonaws.com || true)"
  if [[ -n "${MY_IP:-}" ]]; then
    SSH_CIDR="${MY_IP}/32"
  else
    SSH_CIDR="0.0.0.0/0"
    echo "WARNING: Could not detect your IP; opening SSH to 0.0.0.0/0"
  fi

  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr "$SSH_CIDR" >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 >/dev/null
  echo "Opened ports 22 (${SSH_CIDR}), 80, 443"
else
  echo "Using existing security group: $SG_ID"
fi

echo "==> Checking for an existing running wedbliss-api instance..."
EXISTING_IP="$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=${INSTANCE_NAME}" "Name=instance-state-name,Values=pending,running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text 2>/dev/null || true)"

if [[ -n "${EXISTING_IP:-}" && "$EXISTING_IP" != "None" ]]; then
  EXISTING_ID="$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=${INSTANCE_NAME}" "Name=instance-state-name,Values=pending,running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text)"
  echo "Instance already running: $EXISTING_ID"
  echo ""
  echo "PUBLIC_IP=${EXISTING_IP}"
  exit 0
fi

echo "==> Launching ${INSTANCE_TYPE} instance..."
INSTANCE_ID="$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${INSTANCE_NAME}},{Key=Project,Value=wedbliss}]" \
  --query 'Instances[0].InstanceId' \
  --output text)"
echo "Instance ID: $INSTANCE_ID"

echo "==> Waiting until instance is running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

PUBLIC_IP="$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)"

echo ""
echo "========================================"
echo "EC2 created successfully"
echo "InstanceId: $INSTANCE_ID"
echo "Region:     $REGION"
echo "Type:       $INSTANCE_TYPE"
echo "Key:        $KEY_PATH"
echo "SSH:        ssh -i $KEY_PATH ec2-user@${PUBLIC_IP}"
echo "PUBLIC_IP=${PUBLIC_IP}"
echo "========================================"
