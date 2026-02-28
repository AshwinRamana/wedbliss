/**
 * AWS CloudFront Service
 * Manages adding/removing CNAME aliases on the template CloudFront distribution.
 *
 * Required env vars:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION (default: us-east-1)
 * - CLOUDFRONT_DISTRIBUTION_ID
 */

const {
    CloudFrontClient,
    GetDistributionConfigCommand,
    UpdateDistributionCommand
} = require('@aws-sdk/client-cloudfront');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const client = new CloudFrontClient(awsConfig);
const s3Client = new S3Client(awsConfig);

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'wedbliss-gallery';

/**
 * Add a CNAME alias to the CloudFront distribution.
 * @param {string} domain - e.g. "aanya-vikram.wedbliss.co"
 * @returns {{ distributionId: string, domain: string }}
 */
async function addCloudFrontAlias(domain) {
    if (!DISTRIBUTION_ID) {
        throw new Error('CLOUDFRONT_DISTRIBUTION_ID is not set');
    }

    // Step 1: Get current distribution config
    const getCmd = new GetDistributionConfigCommand({ Id: DISTRIBUTION_ID });
    const getResult = await client.send(getCmd);

    const config = getResult.DistributionConfig;
    const etag = getResult.ETag;

    // Step 2: Check if alias already exists
    const currentAliases = config.Aliases?.Items || [];
    if (currentAliases.includes(domain)) {
        console.log(`[aws] Alias "${domain}" already exists on distribution ${DISTRIBUTION_ID}`);
        return { distributionId: DISTRIBUTION_ID, domain, alreadyExists: true };
    }

    // Step 3: Add the new alias
    config.Aliases = {
        Quantity: currentAliases.length + 1,
        Items: [...currentAliases, domain]
    };

    // Step 4: Update the distribution
    const updateCmd = new UpdateDistributionCommand({
        Id: DISTRIBUTION_ID,
        IfMatch: etag,
        DistributionConfig: config
    });

    await client.send(updateCmd);
    console.log(`[aws] Successfully added alias "${domain}" to distribution ${DISTRIBUTION_ID}`);

    return { distributionId: DISTRIBUTION_ID, domain, alreadyExists: false };
}

/**
 * Remove a CNAME alias from the CloudFront distribution.
 * @param {string} domain - e.g. "aanya-vikram.wedbliss.co"
 */
async function removeCloudFrontAlias(domain) {
    if (!DISTRIBUTION_ID) {
        throw new Error('CLOUDFRONT_DISTRIBUTION_ID is not set');
    }

    const getCmd = new GetDistributionConfigCommand({ Id: DISTRIBUTION_ID });
    const getResult = await client.send(getCmd);

    const config = getResult.DistributionConfig;
    const etag = getResult.ETag;

    const currentAliases = config.Aliases?.Items || [];
    const filtered = currentAliases.filter(a => a !== domain);

    if (filtered.length === currentAliases.length) {
        console.log(`[aws] Alias "${domain}" not found on distribution ${DISTRIBUTION_ID}`);
        return { distributionId: DISTRIBUTION_ID, domain, wasPresent: false };
    }

    config.Aliases = {
        Quantity: filtered.length,
        Items: filtered
    };

    const updateCmd = new UpdateDistributionCommand({
        Id: DISTRIBUTION_ID,
        IfMatch: etag,
        DistributionConfig: config
    });

    await client.send(updateCmd);
    console.log(`[aws] Successfully removed alias "${domain}" from distribution ${DISTRIBUTION_ID}`);

    return { distributionId: DISTRIBUTION_ID, domain, wasPresent: true };
}

/**
 * Generate a pre-signed S3 URL for direct client-side uploads.
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type
 * @param {string} couplename - Folder name for the couple
 */
async function generatePresignedUrl(fileName, fileType, couplename) {
    // Override default bucket to user requested wedbliss.images
    const targetBucket = process.env.AWS_S3_BUCKET_NAME || 'wedbliss.images';

    // Sanitize file name and create unique object key
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = couplename ? couplename.replace(/[^a-zA-Z0-9-_]/g, '') : 'gallery';

    const objectKey = `${folder}/${uniqueId}-${sanitizedName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: targetBucket,
            Key: objectKey,
            ContentType: fileType,
        });

        // URL expires in 3 minutes
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 180 });

        // Construct the public URL (assuming bucket is public or accessed via CF)
        const publicUrl = `https://${targetBucket}.s3.${awsConfig.region}.amazonaws.com/${objectKey}`;

        return { signedUrl, publicUrl, objectKey };
    } catch (error) {
        console.error('[aws] Error generating presigned URL:', error.message);
        return { error: 'Failed to generate upload URL' };
    }
}

module.exports = { addCloudFrontAlias, removeCloudFrontAlias, generatePresignedUrl };
