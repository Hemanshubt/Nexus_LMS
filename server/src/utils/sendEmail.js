"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // 1) Create a transporter
    // For Development: Use Ethereal (fake SMTP service)
    // For Production: Use SendGrid, Mailgun, AWS SES, etc.
    let transporter;
    if (process.env.NODE_ENV === 'production') {
        transporter = nodemailer_1.default.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
    }
    else {
        // Create Ethereal Test Account
        // const testAccount = await nodemailer.createTestAccount(); // Uncomment if you want to generate one
        transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: Number(process.env.EMAIL_PORT) || 587,
            auth: {
                user: process.env.EMAIL_USERNAME || 'ethereal.user@ethereal.email',
                pass: process.env.EMAIL_PASSWORD || 'etherealpassword'
            }
        });
    }
    // 2) Define the email options
    const mailOptions = {
        from: 'Nexus LMS <noreply@nexuslms.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };
    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
    }
};
exports.default = sendEmail;
