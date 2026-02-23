const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── POST /api/invitations — Create a new invitation ────────────────────────
router.post('/', async (req, res) => {
    try {
        const {
            user_email, plan, template_id, subdomain, data: invitationData
        } = req.body;

        if (!user_email || !plan) {
            return res.status(400).json({ error: 'user_email and plan are required' });
        }

        const { data, error } = await supabase
            .from('invitations')
            .insert({
                user_email, plan, template_id,
                subdomain: subdomain || null,
                domain_status: subdomain ? 'pending' : null,
                data: invitationData || {}
            })
            .select()
            .single();

        if (error) {
            console.error('[invitations] Insert error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ invitation: data });
    } catch (err) {
        console.error('[invitations] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/invitations?email=x — Get all invitations for a user ──────────
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'email query param is required' });
        }

        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[invitations] Fetch error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ invitations: data });
    } catch (err) {
        console.error('[invitations] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── PUT /api/invitations/:id — Update an existing invitation ───────────────
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('invitations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[invitations] Update error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ invitation: data });
    } catch (err) {
        console.error('[invitations] Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
