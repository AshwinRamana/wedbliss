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

const client = new CloudFrontClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

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

module.exports = { addCloudFrontAlias, removeCloudFrontAlias };
