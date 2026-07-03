const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async ({ to, subject, html, text }) => {
  const isSmtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_email@gmail.com'
  );

  if (!isSmtpConfigured) {
    console.log('----------------------------------------------------');
    console.log(`[SMTP MOCK] Sending email to: ${to}`);
    console.log(`[SMTP MOCK] Subject: ${subject}`);
    console.log(`[SMTP MOCK] Text Content:\n${text}`);
    console.log('----------------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@instaconnect.com',
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't crash the server, just log the mock link as fallback
    console.log(`[FALLBACK] Email text would be:\n${text}`);
  }
};

module.exports = sendEmail;
