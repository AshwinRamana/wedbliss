/** Render an OTP email without transport, environment access, or side effects. */
function renderOTPEmail(otp, type = 'login') {
    const code = String(otp);
    if (!/^\d{4}$/.test(code)) {
        throw new TypeError('OTP must contain exactly 4 digits.');
    }

    const signup = type === 'signup';
    const subject = signup ? 'Your Wedbliss signup code' : 'Your Wedbliss login code';
    const heading = signup ? 'Create your account' : 'Log in to Wedbliss';
    const instruction = signup
        ? 'Use this 4-digit code to finish signing up.'
        : 'Use this 4-digit code to log in.';
    const text = `Wedbliss\n\n${heading}\n${instruction}\n\n${code}\n\nExpires in 10 minutes. Do not share this code.`;
    const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f8f5ef;color:#632c40;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8f5ef;">
<tr><td align="center" style="padding:48px 20px;">
<table role="presentation" width="480" cellspacing="0" cellpadding="0" style="width:100%;max-width:480px;">
<tr><td style="padding:0 0 32px;border-bottom:1px solid #ded3d1;font-family:Georgia,'Times New Roman',serif;font-size:32px;letter-spacing:-1px;color:#632c40;">Wedbliss</td></tr>
<tr><td style="padding:32px 0 0;font-family:Arial,Helvetica,sans-serif;color:#632c40;">
<h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:normal;">${heading}</h1>
<p style="margin:0;font-size:15px;line-height:24px;">${instruction}</p>
</td></tr>
<tr><td align="center" style="padding:28px 0;">
<div style="padding:22px 12px;background-color:#632c40;color:#f8f5ef;font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:bold;letter-spacing:10px;line-height:48px;">${code}</div>
</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#632c40;">Expires in 10 minutes.<br>Do not share this code.</td></tr>
</table>
</td></tr></table>
</body></html>`;
    return { subject, text, html };
}

module.exports = { renderOTPEmail };
