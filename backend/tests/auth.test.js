const test = require('node:test');
const assert = require('node:assert/strict');
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-key';
const express = require('express');
const { createAuthRouter } = require('../routes/auth');

test('OTP sessions: normalization, throttling, attempts, expiry, replay and provider failures', async () => {
    let now = Date.now(), delivered, failProvider = false, userExists = true;
    const user = { id: 'qa-user', email: 'qa@example.com' };
    const admin = { auth: { admin: {
        listUsers: async () => ({ data: { users: userExists ? [user] : [] } }),
        createUser: async () => ({ data: { user } }),
        updateUserById: async () => ({}),
        generateLink: async () => failProvider ? { error: { code: 'provider_failure' } } : { data: { properties: { hashed_token: 'server-token' } } },
    } } };
    const app = express(); app.use(express.json());
    app.use(createAuthRouter({ admin, now: () => now, makeCode: () => '1234', sendEmail: async (email, otp, type) => { delivered = { email, otp, type }; return { success: true }; }, createPublicClient: () => ({ auth: { verifyOtp: async () => ({ data: { user, session: { access_token: 'access', refresh_token: 'refresh' } } }) } }) }));
    const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
    const call = async (path, body) => { const r = await fetch(`http://127.0.0.1:${server.address().port}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() }; };
    const send = () => call('send-otp', { email: ' QA@Example.com ', type: 'login' });
    const verify = otp => call('verify-otp', { email: 'qa@example.com', otp });
    try {
        assert.equal((await send()).status, 200); assert.equal(delivered.email, 'qa@example.com');
        assert.equal((await send()).status, 429);
        assert.equal((await verify('9999')).status, 400);
        const good = await verify('1234'); assert.equal(good.status, 200); assert.deepEqual(good.data.session, { access_token: 'access', refresh_token: 'refresh' }); assert.equal(good.data.sessionPassword, undefined);
        assert.equal((await verify('1234')).status, 400);
        now += 31000; await send(); for (let i = 0; i < 4; i++) assert.equal((await verify('9999')).status, 400); assert.equal((await verify('9999')).status, 429); assert.equal((await verify('1234')).status, 400);
        now += 31000; await send(); now += 600001; assert.equal((await verify('1234')).status, 400);
        await send(); failProvider = true; assert.equal((await verify('1234')).status, 503); failProvider = false; assert.equal((await verify('1234')).status, 200);
        now += 31000; userExists = false; assert.equal((await send()).status, 404);
        now += 31000; assert.equal((await call('send-otp', { email: 'qa@example.com', type: 'signup' })).status, 200);
        assert.equal((await call('verify-otp', { email: 'qa@example.com', otp: '1234', name: 'QA', phone: '0000000000', dob: '2020-01-01' })).status, 400);
        assert.equal((await call('verify-otp', { email: 'qa@example.com', otp: '1234', name: 'QA', phone: '0000000000', dob: '1995-01-01' })).status, 200);
    } finally { await new Promise(r => server.close(r)); }
});
