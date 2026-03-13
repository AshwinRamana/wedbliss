require('dotenv').config({ path: '../.env.local' });
const axios = require('axios');

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const TARGET = process.env.TEMPLATE_CF_DOMAIN;

async function debugCloudflare() {
    console.log('--- Cloudflare Debug Start ---');
    console.log('Token (first 5):', CLOUDFLARE_API_TOKEN?.substring(0, 5));
    console.log('Zone ID:', CLOUDFLARE_ZONE_ID);
    console.log('Target:', TARGET);

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID || !TARGET) {
        console.error('Missing environment variables!');
        return;
    }

    const testSubdomain = `debug-${Date.now()}`;
    const fullName = `${testSubdomain}.wedbliss.co`;

    const cfApi = axios.create({
        baseURL: 'https://api.cloudflare.com/client/v4',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    try {
        console.log(`\nAttempting to create record for: ${fullName} (using full name)`);
        const res = await cfApi.post(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
            type: 'CNAME',
            name: fullName,
            content: TARGET,
            ttl: 1,
            proxied: false // Turning off proxy for testing to ensure basic DNS works first
        });

        console.log('✅ SUCCESS (Full Name):', res.data.result.id);
        
        // Cleanup
        console.log('Cleaning up...');
        await cfApi.delete(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${res.data.result.id}`);
        console.log('✅ Cleanup successful.');

    } catch (err) {
        console.error('❌ FAILED (Full Name):', err.response?.data || err.message);
    }

    try {
        const shortName = `short-${Date.now()}`;
        console.log(`\nAttempting to create record for: ${shortName} (using short name)`);
        const res = await cfApi.post(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
            type: 'CNAME',
            name: shortName,
            content: TARGET,
            ttl: 1,
            proxied: false
        });

        console.log('✅ SUCCESS (Short Name):', res.data.result.id);
        
        // Cleanup
        console.log('Cleaning up...');
        await cfApi.delete(`/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${res.data.result.id}`);
        console.log('✅ Cleanup successful.');

    } catch (err) {
        console.error('❌ FAILED (Short Name):', err.response?.data || err.message);
    }
}

debugCloudflare();
