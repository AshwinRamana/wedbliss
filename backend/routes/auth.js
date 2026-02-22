const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { sendOTPEmail } = require('../services/email');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Store OTPs temporarily in memory for basic validation without a database table.
// In production, you would store this in Redis or a Supabase table with an expiry.
const otpStore = new Map();

router.post('/send-otp', async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!type || (type !== 'login' && type !== 'signup')) {
        return res.status(400).json({ error: 'Valid request type (login or signup) is required' });
    }

    try {
        // Deterministic dummy password to verify existence
        const dummyPassword = crypto.createHmac('sha256', supabaseKey).update(email).digest('hex').slice(0, 16) + "Aa1!";

        // Check if the user exists by attempting a silent login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: dummyPassword
        });

        const userExists = signInData.user !== null;

        if (type === 'signup' && userExists) {
            return res.status(400).json({ error: 'Account already exists. Please log in.' });
        }

        if (type === 'login' && !userExists) {
            return res.status(404).json({ error: 'Account not found. Please sign up first.' });
        }

        // Generate a random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Store the OTP with expiration (10 minutes)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        // Send email using Nodemailer
        const emailResult = await sendOTPEmail(email, otp);

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }

        res.status(200).json({
            message: 'OTP sent successfully',
            // ONLY FOR DEVELOPMENT - Remove in production!
            previewUrl: emailResult.previewUrl
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp, name, phone } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ error: 'No OTP requested for this email' });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (record.otp !== otp.toString()) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP is valid. Clear it.
        otpStore.delete(email);

        // Generate a deterministic, secure dummy password for this email to link them
        // into the Supabase Auth ecosystem quietly without them knowing.
        const dummyPassword = crypto.createHmac('sha256', supabaseKey).update(email).digest('hex').slice(0, 16) + "Aa1!";

        // Attempt to create the user in Supabase. 
        // If they already exist, this will gracefully fail.
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: dummyPassword,
            options: {
                data: {
                    name: name || '',
                    phone: phone || '',
                }
            }
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
            console.error('Supabase Sign Up Error in verify-otp:', signUpError);
        }

        // Return the secure dummy password so the frontend can silently authenticate
        // and establish a real Supabase session cookie in the browser.
        res.status(200).json({
            message: 'OTP verified successfully',
            user: { email, name, phone },
            sessionPassword: dummyPassword
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
