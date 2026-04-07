const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL, // Your Gmail address
                pass: process.env.SMTP_PASSWORD, // Your App Password
            },
        });

        const message = {
            from: `${process.env.FROM_NAME || 'AutoDetail Pro'} <${process.env.FROM_EMAIL || 'noreply@autodetailpro.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const info = await transporter.sendMail(message);

        console.log('✉️ Email sent: %s', info.messageId);
        
        console.log('✉️ Email sent to %s via Gmail', options.email);
    } catch (err) {
        console.error('Email sending failed:', err);
    }
};

module.exports = sendEmail;
