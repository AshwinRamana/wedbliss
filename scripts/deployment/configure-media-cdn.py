# Reconcile the existing private S3 media origin; preserves other CDN behaviors and bucket policy statements.
# Run only when intentionally provisioning this account’s media delivery.
import boto3,json,copy
from pathlib import Path
s=boto3.Session();account=s.client('sts').get_caller_identity()['Account'];assert account=='097300397535'
cf=s.client('cloudfront');s3=s.client('s3',region_name='ap-south-1');dist='E3TFB2K5BLL06D';bucket='wedbliss-images'
response=cf.get_distribution_config(Id=dist);config=response['DistributionConfig'];Path('/tmp/wedbliss-cdn-before-media.json').write_text(json.dumps(response))
try: policy=json.loads(s3.get_bucket_policy(Bucket=bucket)['Policy'])
except s3.exceptions.ClientError as e:
 if e.response['Error']['Code']!='NoSuchBucketPolicy':raise
 policy={'Version':'2012-10-17','Statement':[]}
Path('/tmp/wedbliss-media-policy-before.json').write_text(json.dumps(policy))
statement={'Sid':'AllowWedblissCDNMediaRead','Effect':'Allow','Principal':{'Service':'cloudfront.amazonaws.com'},'Action':'s3:GetObject','Resource':'arn:aws:s3:::wedbliss-images/media/*','Condition':{'StringEquals':{'AWS:SourceArn':f'arn:aws:cloudfront::{account}:distribution/{dist}'}}}
policy['Statement']=[x for x in policy['Statement'] if x.get('Sid')!=statement['Sid']]+[statement]
s3.put_bucket_policy(Bucket=bucket,Policy=json.dumps(policy))
origin=copy.deepcopy(config['Origins']['Items'][0]);origin['Id']='S3-wedbliss-media';origin['DomainName']='wedbliss-images.s3.ap-south-1.amazonaws.com';origin['OriginPath']=''
origins=[o for o in config['Origins']['Items'] if o['Id']!=origin['Id']]+[origin];config['Origins']={'Quantity':len(origins),'Items':origins}
behavior=copy.deepcopy(config['DefaultCacheBehavior']);behavior.update({'PathPattern':'media/*','TargetOriginId':origin['Id'],'DefaultTTL':86400})
behaviors=[b for b in config['CacheBehaviors'].get('Items',[]) if b['PathPattern']!='media/*']+[behavior];config['CacheBehaviors']={'Quantity':len(behaviors),'Items':behaviors}
r=cf.update_distribution(Id=dist,IfMatch=response['ETag'],DistributionConfig=config);print('Added private S3 media origin and /media/* behavior:',r['Distribution']['Status'])
