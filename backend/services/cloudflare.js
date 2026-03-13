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
 * Create a CNAME record for a subdomain.
 * @param {string} subdomain - e.g. "priya-karthik"
 * @param {string} target - e.g. "dhtsr80g2t15g.cloudfront.net"
 */
async function createSubdomainRecord(subdomain, target) {
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
        throw new Error('Cloudflare credentials not configured');
    }

    try {
        console.log(`[cloudflare] Creating CNAME for ${subdomain}.wedbliss.co -> ${target}`);
        
        const response = await cfApi.post(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
            type: 'CNAME',
            name: subdomain, // Cloudflare allows just the prefix or the full name
            content: target,
            ttl: 1, // 1 = automatic
            proxied: true // Enabling proxying for Cloudflare value-add (SSL, etc.)
        });

        return response.data.result;
    } catch (error) {
        console.error('[cloudflare] Error creating DNS record:', error.response?.data || error.message);
        throw new Error(`DNS record creation failed: ${JSON.stringify(error.response?.data?.errors || error.message)}`);
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
