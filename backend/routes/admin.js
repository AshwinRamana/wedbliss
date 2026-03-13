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

// ── GET /api/admin/users — List all registered Supabase Auth users ──────────
router.get('/users', async (req, res) => {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' });
        }

        const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Fetch up to 1000 users from Supabase Auth
        const { data, error } = await adminSupabase.auth.admin.listUsers();
        if (error) {
            console.error('[admin] Fetch users error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ users: data.users || [] });
    } catch (err) {
        console.error('[admin] Fetch users exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── DELETE /api/admin/users/:uid — Delete a Supabase Auth user entirely ────
router.delete('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' });
        }

        const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data, error } = await adminSupabase.auth.admin.deleteUser(uid);

        if (error) {
            console.error(`[admin] Delete user ${uid} error:`, error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('[admin] Delete user exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Helper: Provision Template Domain ─────────────────────────────────────
async function provisionTemplateDomain(adminSupabase, { 
    subdomain, templateId, mockData, distributionId, cfDomain 
}) {
    const fullDomain = `${subdomain}.wedbliss.co`;
    const demoData = {
        ...(mockData || {}),
        metadata: { plan: 'premium', template_id: templateId, createdAt: new Date().toISOString() },
    };

    let provisioning = { cloudfront: null, dns: null };
    
    // 1. CloudFront Alias
    console.log(`[provision] Step 1: CloudFront. Distribution: ${distributionId}, AWS_KEY: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING'}`);
    if (process.env.AWS_ACCESS_KEY_ID && distributionId) {
        try {
            const aws = getAwsService();
            provisioning.cloudfront = await aws.addCloudFrontAlias(fullDomain);
            console.log(`[provision] CloudFront result:`, provisioning.cloudfront);
        } catch (e) { 
            console.error(`[provision] CloudFront error:`, e.message);
            provisioning.cloudfront = { error: e.message }; 
        }
    }

    // 2. Cloudflare DNS
    console.log(`[provision] Step 2: Cloudflare. CF_DOMAIN: ${cfDomain}, CF_TOKEN: ${process.env.CLOUDFLARE_API_TOKEN ? 'SET' : 'MISSING'}`);
    if (process.env.CLOUDFLARE_API_TOKEN && cfDomain) {
        try {
            const cloudflare = require('../services/cloudflare');
            provisioning.dns = await cloudflare.createSubdomainRecord(subdomain, cfDomain);
            console.log(`[provision] Cloudflare result:`, provisioning.dns);
        } catch (e) { 
            console.error(`[provision] Cloudflare error:`, e.message);
            provisioning.dns = { error: e.message }; 
        }
    }

    // 3. Upsert Invitation
    const { data: existing } = await adminSupabase
        .from('invitations')
        .select('id')
        .eq('subdomain', subdomain)
        .limit(1)
        .maybeSingle();

    if (existing) {
        await adminSupabase.from('invitations').update({ 
            template_id: templateId, data: demoData, domain_status: 'active', updated_at: new Date().toISOString()
        }).eq('id', existing.id);
    } else {
        await adminSupabase.from('invitations').insert({
            user_email: 'demo@wedbliss.co', plan: 'premium', template_id: templateId,
            subdomain, domain_status: 'active', data: demoData, cloudfront_id: distributionId || null
        });
    }

    return { fullDomain, provisioning };
}

// ── POST /api/admin/push-demo — Update elegant demo ───────────────────────
router.post('/push-demo', async (req, res) => {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey || '');
        const { templateId, templateName, htmlContent, cssContent, jsContent, thumbnailUrl, mockData } = req.body;

        if (!templateId || !htmlContent) return res.status(400).json({ error: 'Missing content' });

        // 1. Upsert template as draft - provide defaults for demo mode
        await adminSupabase.from('templates').upsert({
            id: templateId, 
            name: templateName || templateId, // Default to ID if name missing
            tier: 'premium',
            description: 'Quick Demo',
            html_content: htmlContent, 
            css_content: cssContent || null, 
            js_content: jsContent || null,
            thumbnail_url: thumbnailUrl || null, 
            is_live: false, 
            is_hero: false
        }, { onConflict: 'id' });

        // 2. Provision/Update Domain Invitation
        const subdomain = 'elegant';
        const { fullDomain, provisioning } = await provisionTemplateDomain(adminSupabase, {
            subdomain, templateId, mockData,
            distributionId: process.env.TEMPLATE_CF_DISTRIBUTION_ID,
            cfDomain: process.env.TEMPLATE_CF_DOMAIN
        });

        res.json({ ok: true, message: `Demo updated on ${fullDomain}`, demoUrl: `https://${fullDomain}`, provisioning });
    } catch (err) {
        console.error('[push-demo] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/admin/push-live — Provision custom domain & set Live ────────
router.post('/push-live', async (req, res) => {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey || '');
        const { 
            templateId, templateName, tier, templateDesc, 
            htmlContent, cssContent, jsContent, thumbnailUrl, mockData, subdomain 
        } = req.body;

        if (!templateId || !htmlContent || !subdomain) {
            return res.status(400).json({ error: 'templateId, htmlContent and subdomain are required' });
        }

        console.log(`[push-live] Starting push for template: ${templateId}, subdomain: ${subdomain}`);
        console.log(`[push-live] Content lengths - HTML: ${htmlContent.length}, CSS: ${cssContent?.length || 0}, JS: ${jsContent?.length || 0}`);

        // 1. Upsert template as LIVE first so it exists before the invitation references it
        const { error: tplErr } = await adminSupabase.from('templates').upsert({
            id: templateId,
            name: templateName || templateId,
            tier: tier || 'premium',
            description: templateDesc || '',
            is_live: true,
            is_hero: false,
            html_content: htmlContent,
            css_content: cssContent || null,
            js_content: jsContent || null,
            thumbnail_url: thumbnailUrl || null,
        }, { onConflict: 'id' });

        if (tplErr) {
            console.error('[push-live] Template upsert error:', tplErr);
            throw tplErr;
        }

        // 2. Provision/Update Domain Invitation
        const { fullDomain, provisioning } = await provisionTemplateDomain(adminSupabase, {
            subdomain, templateId, mockData,
            distributionId: process.env.TEMPLATE_CF_DISTRIBUTION_ID,
            cfDomain: process.env.TEMPLATE_CF_DOMAIN
        });

        // 3. Update the template's demo_url now that we have the fullDomain
        await adminSupabase.from('templates').update({
            demo_url: `https://${fullDomain}`
        }).eq('id', templateId);

        res.json({ ok: true, message: `Template is now LIVE on ${fullDomain}`, liveUrl: `https://${fullDomain}`, provisioning });
    } catch (err) {
        console.error('[push-live] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

