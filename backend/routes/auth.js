const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { sendOTPEmail } = require('../services/email');

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

function createAuthRouter({ admin, createPublicClient, sendEmail = sendOTPEmail, now = Date.now, makeCode = () => String(crypto.randomInt(1000, 10000)) }) {
    const router = express.Router();
    const codes = new Map();
    const sends = new Map();
    const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
    const validEmail = value => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const fail = (res, error, message) => {
        console.error('[auth]', error?.code || error?.name || 'provider_error');
        return res.status(503).json({ error: message });
    };

    async function findUser(email) {
        // Admin API is server-only. Do not infer account existence from password failures.
        for (let page = 1; ; page++) {
            const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
            if (error) throw error;
            const user = data.users.find(u => normalizeEmail(u.email) === email);
            if (user) return user;
            if (data.users.length < 200) return null;
        }
    }

    router.post('/send-otp', async (req, res) => {
        const email = normalizeEmail(req.body.email);
        const { type } = req.body;
        if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
        if (!['login', 'signup'].includes(type)) return res.status(400).json({ error: 'Choose login or signup.' });
        const time = now();
        for (const [key, value] of codes) if (value.expiresAt < time) codes.delete(key);
        for (const [key, value] of sends) if (value.resetAt < time) sends.delete(key);
        const previous = sends.get(email);
        if (previous && (previous.nextAt > time || previous.count >= 10)) {
            res.set('Retry-After', String(Math.ceil(((previous.count >= 10 ? previous.resetAt : previous.nextAt) - time) / 1000)));
            return res.status(429).json({ error: 'Please wait before requesting another code.' });
        }
        sends.set(email, { nextAt: time + 30000, resetAt: previous?.resetAt || time + 3600000, count: (previous?.count || 0) + 1 });
        try {
            const user = await findUser(email);
            if (type === 'login' && !user) return res.status(404).json({ error: 'Account not found. Please create an account.' });
            if (type === 'signup' && user) return res.status(409).json({ error: 'You already have an account. Please log in.' });
            const otp = makeCode();
            const record = { digest: crypto.createHash('sha256').update(otp).digest(), expiresAt: time + 600000, type, userId: user?.id, attempts: 0, verifying: false };
            codes.set(email, record);
            const result = await sendEmail(email, otp, type);
            if (!result.success) { codes.delete(email); throw new Error('email_delivery_failed'); }
            res.set('Cache-Control', 'no-store');
            return res.json({ message: 'Verification code sent. It expires in 10 minutes.' });
        } catch (error) {
            return fail(res, error, 'We could not send your code. Please try again shortly.');
        }
    });

    router.post('/verify-otp', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        const email = normalizeEmail(req.body.email);
        const otp = String(req.body.otp || '');
        if (!validEmail(email) || !/^\d{4}$/.test(otp)) return res.status(400).json({ error: 'Enter your email and the 4-digit code.' });
        const record = codes.get(email);
        if (!record) return res.status(400).json({ error: 'Request a new verification code.' });
        if (record.expiresAt <= now()) { codes.delete(email); return res.status(400).json({ error: 'Your code has expired. Request a new one.' }); }
        if (record.verifying) return res.status(409).json({ error: 'Your code is already being verified. Please wait.' });
        const digest = crypto.createHash('sha256').update(otp).digest();
        if (!crypto.timingSafeEqual(record.digest, digest)) {
            record.attempts++;
            if (record.attempts >= 5) { codes.delete(email); return res.status(429).json({ error: 'Too many attempts. Please request a new code.' }); }
            return res.status(400).json({ error: 'That code is not correct. Please try again.' });
        }
        record.verifying = true;
        try {
            if (record.type === 'signup' && !record.userId) {
                const { name, phone, dob } = req.body;
                const birthday = typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob) ? new Date(dob + 'T00:00:00Z') : new Date(NaN);
                const cutoff = new Date(now()); cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
                if (typeof name !== 'string' || !name.trim() || typeof phone !== 'string' || !phone.trim() || !Number.isFinite(birthday.getTime()) || birthday.toISOString().slice(0, 10) !== dob || birthday > cutoff) {
                    return res.status(400).json({ error: 'Enter your name, phone number, and date of birth. You must be at least 18.' });
                }
                const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true, password: crypto.randomBytes(32).toString('base64url'), user_metadata: { name: name.trim().slice(0, 150), phone: phone.trim().slice(0, 30), dob } });
                if (error) throw error;
                record.userId = data.user.id;
            }
            // Possession of the custom email OTP has been checked above. Supabase now
            // issues the real session; no public-key-derived password goes to the browser.
            const { error: updateError } = await admin.auth.admin.updateUserById(record.userId, { email_confirm: true });
            if (updateError) throw updateError;
            const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
            if (linkError) throw linkError;
            const { data, error } = await createPublicClient().auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' });
            if (error || !data.session) throw error || new Error('session_missing');
            codes.delete(email);
            return res.json({ message: 'Signed in successfully.', session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token }, user: { id: data.user.id, email: data.user.email } });
        } catch (error) {
            return fail(res, error, 'Your code is correct, but sign-in could not finish. Please try again.');
        } finally { record.verifying = false; }
    });
    return router;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const router = createAuthRouter({
    admin: createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, clientOptions),
    createPublicClient: () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, clientOptions),
});
module.exports = router;
module.exports.createAuthRouter = createAuthRouter;
