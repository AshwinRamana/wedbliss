const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create an order
router.post('/order', async (req, res) => {
    const { amount, currency, receipt } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
});

// Verify payment signature + optionally trigger domain provisioning
router.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invitation_id, subdomain } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
        return res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
    }

    // Payment is authentic — update invitation status in DB if we have the ID
    if (invitation_id) {
        try {
            await supabase
                .from('invitations')
                .update({ 
                    payment_status: 'paid',
                    razorpay_order_id,
                    razorpay_payment_id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invitation_id);
        } catch (dbErr) {
            console.error('[payment] DB update error:', dbErr);
        }
    }

    res.status(200).json({ status: 'success', message: 'Payment verified successfully' });
});

// Retry provision for an invitation (admin use or post-payment fallback)
router.post('/retry-provision', async (req, res) => {
    const { invitation_id } = req.body;
    if (!invitation_id) {
        return res.status(400).json({ error: 'invitation_id is required' });
    }

    try {
        const { data, error } = await supabase
            .from('invitations')
            .select('id, subdomain')
            .eq('id', invitation_id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Invitation not found' });
        }
        if (!data.subdomain) {
            return res.status(400).json({ error: 'No subdomain set on this invitation' });
        }

        // Delegate to /api/domains/provision
        const domainRoutes = require('./domains');
        // Synthetic req/res for internal call — just forward
        const provRes = await fetch(`http://localhost:${process.env.PORT || 4000}/api/domains/provision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitation_id, subdomain: data.subdomain })
        });
        const provData = await provRes.json();
        res.status(provRes.status).json(provData);
    } catch (err) {
        console.error('[payment] retry-provision error:', err);
        res.status(500).json({ error: 'Retry provision failed', details: err.message });
    }
});

module.exports = router;

