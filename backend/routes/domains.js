const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Lazy-load AWS service only when provisioning (avoids crash if creds not set yet)
let awsService = null;
function getAwsService() {
    if (!awsService) {
        awsService = require('../services/aws');
    }
    return awsService;
}

// ── GET /api/domains/check?subdomain=x — Check availability ────────────────
router.get('/check', async (req, res) => {
    try {
        const { subdomain } = req.query;
        if (!subdomain) {
            return res.status(400).json({ error: 'subdomain query param is required' });
        }

        // Validate subdomain format (lowercase alphanumeric + hyphens, 3-30 chars)
        const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
        if (!subdomainRegex.test(subdomain)) {
            return res.status(400).json({
                available: false,
                error: 'Subdomain must be 3-30 characters, lowercase letters, numbers, and hyphens only'
            });
        }

        // Reserved subdomains
        const reserved = ['www', 'api', 'app', 'admin', 'mail', 'ftp', 'test', 'demo', 'staging', 'dev'];
        if (reserved.includes(subdomain)) {
            return res.status(200).json({ available: false, reason: 'reserved' });
        }

        const { data, error } = await supabase
            .from('invitations')
            .select('id')
            .eq('subdomain', subdomain)
            .limit(1);

        if (error) {
            console.error('[domains] Check error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        const available = !data || data.length === 0;
        res.status(200).json({ available, subdomain: `${subdomain}.wedbliss.co` });
    } catch (err) {
        console.error('[domains] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/domains/provision — Add subdomain to CloudFront ──────────────
router.post('/provision', async (req, res) => {
    try {
        const { invitation_id, subdomain } = req.body;

        if (!invitation_id || !subdomain) {
            return res.status(400).json({ error: 'invitation_id and subdomain are required' });
        }

        const fullDomain = `${subdomain}.wedbliss.co`;

        // Update status to provisioning
        await supabase
            .from('invitations')
            .update({ domain_status: 'provisioning', updated_at: new Date().toISOString() })
            .eq('id', invitation_id);

        // Check if AWS creds are configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.CLOUDFRONT_DISTRIBUTION_ID) {
            console.warn('[domains] AWS credentials not configured. Skipping CloudFront provisioning.');
            // Still mark as active for development
            await supabase
                .from('invitations')
                .update({ domain_status: 'active', updated_at: new Date().toISOString() })
                .eq('id', invitation_id);

            return res.status(200).json({
                success: true,
                domain: fullDomain,
                note: 'AWS not configured — marked active for development'
            });
        }

        // Attempt CloudFront alias addition
        try {
            const aws = getAwsService();
            const result = await aws.addCloudFrontAlias(fullDomain);

            await supabase
                .from('invitations')
                .update({
                    domain_status: 'active',
                    cloudfront_id: result.distributionId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invitation_id);

            res.status(200).json({ success: true, domain: fullDomain, cloudfront: result });
        } catch (awsErr) {
            console.error('[domains] CloudFront error:', awsErr);

            await supabase
                .from('invitations')
                .update({ domain_status: 'failed', updated_at: new Date().toISOString() })
                .eq('id', invitation_id);

            res.status(500).json({ error: 'CloudFront provisioning failed', details: awsErr.message });
        }
    } catch (err) {
        console.error('[domains] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
