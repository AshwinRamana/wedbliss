const axios = require('axios');

/**
 * Cloudflare DNS Service
 * Manages CNAME records for wedding subdomains.
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const BASE_URL = 'https://api.cloudflare.com/client/v4';

const cfApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Create or Update a CNAME record for a subdomain.
 * @param {string} subdomain - e.g. "priya-karthik"
 * @param {string} target - e.g. "dhtsr80g2t15g.cloudfront.net"
 */
async function createSubdomainRecord(subdomain, target) {
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
        throw new Error('Cloudflare credentials not configured');
    }

    const fullName = `${subdomain}.wedbliss.co`;

    try {
        console.log(`[cloudflare] Provisioning CNAME for ${fullName} -> ${target}`);

        // 1. Check if record already exists
        const listRes = await cfApi.get(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
            params: { name: fullName, type: 'CNAME' }
        });

        const existingRecord = listRes.data.result[0];

        if (existingRecord) {
            console.log(`[cloudflare] Record exists (ID: ${existingRecord.id}), updating...`);
            const updateRes = await cfApi.put(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${existingRecord.id}`, {
                type: 'CNAME',
                name: fullName,
                content: target,
                ttl: 1,
                proxied: false // Setting to false by default for CloudFront consistency unless proxied SSL is managed
            });
            return updateRes.data.result;
        } else {
            console.log(`[cloudflare] Record not found, creating new...`);
            const createRes = await cfApi.post(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
                type: 'CNAME',
                name: fullName,
                content: target,
                ttl: 1,
                proxied: false
            });
            return createRes.data.result;
        }
    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error('[cloudflare] Error provisioning DNS record:', errorData);
        throw new Error(`DNS provisioning failed: ${JSON.stringify(error.response?.data?.errors || error.message)}`);
    }
}

/**
 * Delete a DNS record for a subdomain.
 * @param {string} subdomain - e.g. "priya-karthik"
 */
async function deleteSubdomainRecord(subdomain) {
    try {
        // Step 1: Find the record ID
        const listRes = await cfApi.get(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
            params: { name: `${subdomain}.wedbliss.co`, type: 'CNAME' }
        });

        const record = listRes.data.result[0];
        if (!record) {
            console.log(`[cloudflare] Record for ${subdomain} not found, skipping delete.`);
            return;
        }

        // Step 2: Delete by ID
        await cfApi.delete(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${record.id}`);
        console.log(`[cloudflare] Successfully deleted DNS record for ${subdomain}`);
    } catch (error) {
        console.error('[cloudflare] Error deleting DNS record:', error.response?.data || error.message);
    }
}

module.exports = { createSubdomainRecord, deleteSubdomainRecord };
