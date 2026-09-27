const nodemailer = require('nodemailer');
const { renderOTPEmail } = require('./email-template');

let transporter;

function initTransporter() {
    if (!transporter) {
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD;
        if (!user || !pass) {
            throw new Error('Email transport is not configured.');
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
    }
    return transporter;
}

const sendOTPEmail = async (email, otp, type = 'login') => {
    try {
        const content = renderOTPEmail(otp, type);
        const trans = initTransporter();
        const info = await trans.sendMail({
            from: `"Wedbliss" <${process.env.GMAIL_USER}>`,
            to: email,
            ...content,
        });
        return { success: true, messageId: info.messageId };
    } catch {
        // SMTP errors can contain recipient addresses and credentials.
        return { success: false, error: 'Unable to send verification email.' };
    }
};

module.exports = { sendOTPEmail };
