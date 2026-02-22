const nodemailer = require('nodemailer');

// Real SMTP transporter using Gmail
let transporter;

async function initTransporter() {
    if (!transporter) {
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD;

        if (!user || !pass) {
            console.error("❌ ERROR: GMAIL_USER or GMAIL_APP_PASSWORD is not set in your .env file!");
            console.error("Please generate an App Password in your Google Account settings and add it.");
            // We still create the transporter but it will fail on send, which is expected
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });
        console.log("✅ Gmail SMTP initialized for real email delivery.");
    }
    return transporter;
}

const sendOTPEmail = async (to, otp) => {
    try {
        const trans = await initTransporter();
        const user = process.env.GMAIL_USER || 'no-reply@vaazh.co';

        const info = await trans.sendMail({
            from: `"Vaazh Invitations" <${user}>`,
            to: to,
            subject: "Your Vaazh Verification Code",
            text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #047857; text-align: center;">Vaazh</h2>
                    <p>Hello,</p>
                    <p>Use the following code to verify your email address. It will expire in 10 minutes.</p>
                    <div style="background-color: #f8fafc; padding: 16px; margin: 24px 0; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">
                        ${otp}
                    </div>
                    <p>If you did not request this code, you can safely ignore this email.</p>
                </div>
            `,
        });
        console.log("\n========================================================");
        console.log("💌 REAL OTP EMAIL SENT VIA GMAIL!");
        console.log("========================================================");
        console.log(`To: ${to}`);
        console.log(`Message ID: ${info.messageId}`);
        console.log("========================================================\n");
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email via Gmail:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail };
