const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Lazy-load AWS service
let awsService = null;
function getAwsService() {
    if (!awsService) {
        awsService = require('../services/aws');
    }
    return awsService;
}

// ── GET /api/admin/domains — List all active domains ───────────────────────
router.get('/domains', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('invitations')
            .select('id, user_email, subdomain, domain_status, cloudfront_id, created_at, data')
            .not('subdomain', 'is', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[admin] Fetch domains error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ domains: data || [] });
    } catch (err) {
        console.error('[admin] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── DELETE /api/admin/domains/:id — Remove domain from CloudFront + DB ─────
router.delete('/domains/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch the invitation to get the subdomain
        const { data: invitation, error: fetchError } = await supabase
            .from('invitations')
            .select('subdomain, cloudfront_id, domain_status')
            .eq('id', id)
            .single();

        if (fetchError || !invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (!invitation.subdomain) {
            return res.status(400).json({ error: 'No domain configured for this invitation' });
        }

        const fullDomain = `${invitation.subdomain}.wedbliss.co`;
        const results = { cloudfront: null, namecheap: null, db: null };

        // 2. Remove from CloudFront (if AWS is configured)
        if (process.env.AWS_ACCESS_KEY_ID && process.env.CLOUDFRONT_DISTRIBUTION_ID) {
            try {
                const aws = getAwsService();
                results.cloudfront = await aws.removeCloudFrontAlias(fullDomain);
            } catch (cfErr) {
                console.error('[admin] CloudFront removal error:', cfErr.message);
                results.cloudfront = { error: cfErr.message };
            }
        } else {
            results.cloudfront = { skipped: true, reason: 'AWS not configured' };
        }

        // 3. Namecheap DNS removal (future — placeholder)
        // When Namecheap API is integrated, remove the CNAME record here
        results.namecheap = { skipped: true, reason: 'Namecheap API not yet integrated' };

        // 4. Clean up DB record
        const { error: updateError } = await supabase
            .from('invitations')
            .update({
                subdomain: null,
                domain_status: null,
                cloudfront_id: null
            })
            .eq('id', id);

        if (updateError) {
            console.error('[admin] DB update error:', updateError.message);
            results.db = { error: updateError.message };
        } else {
            results.db = { success: true };
        }

        res.status(200).json({
            success: true,
            message: `Domain ${fullDomain} removed successfully`,
            details: results
        });
    } catch (err) {
        console.error('[admin] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
