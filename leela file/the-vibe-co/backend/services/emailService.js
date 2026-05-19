const nodemailer = require('nodemailer');

let transporter = null;
let transporterVerified = false;

const getTransporter = () => {
  if (transporter) return transporter;

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim() : '';

  if (!smtpEmail || !smtpPassword) {
    console.error('❌ [Email Service] SMTP_EMAIL or SMTP_PASSWORD is missing in .env file!');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpEmail,
      pass: smtpPassword
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 second timeout
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  return transporter;
};

const verifyTransporter = async () => {
  if (transporterVerified) return true;

  const t = getTransporter();
  if (!t) return false;

  try {
    await t.verify();
    transporterVerified = true;
    console.log('✅ [Email Service] SMTP connection verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ [Email Service] SMTP verification FAILED:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   → Your Gmail App Password is INVALID or EXPIRED.');
      console.error('   → Go to: https://myaccount.google.com/apppasswords');
      console.error('   → Generate a new App Password and update SMTP_PASSWORD in .env');
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      console.error('   → Cannot connect to Gmail SMTP server. Check your internet connection.');
    }
    // Reset transporter so it can be recreated with new credentials
    transporter = null;
    return false;
  }
};

const sendEmail = async (options, retryCount = 0) => {
  const maxRetries = 2;

  try {
    // Verify on first use
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      console.error(`❌ [Email Service] Cannot send email to ${options.email} - SMTP not configured properly.`);
      return false;
    }

    const t = getTransporter();
    const smtpEmail = process.env.SMTP_EMAIL;

    const message = {
      from: `${process.env.FROM_NAME || 'THE VIBE CO.'} <${smtpEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      attachments: options.attachments || []
    };

    console.log(`📧 [Email Service] Sending email to ${options.email} | Subject: ${options.subject}`);
    const info = await t.sendMail(message);
    console.log(`✅ [Email Service] Email sent successfully to ${options.email} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Email Service] Error sending email to ${options.email}: ${error.message}`);

    if (error.code === 'EAUTH') {
      console.error('   → Gmail App Password is INVALID or EXPIRED. Please regenerate it.');
      console.error('   → Go to: https://myaccount.google.com/apppasswords');
      // Reset transporter so next attempt will re-verify
      transporter = null;
      transporterVerified = false;
    }

    // Retry on transient errors
    if (retryCount < maxRetries && ['ECONNECTION', 'ESOCKET', 'ETIMEDOUT'].includes(error.code)) {
      console.log(`🔄 [Email Service] Retrying... (attempt ${retryCount + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return sendEmail(options, retryCount + 1);
    }

    return false;
  }
};

// Export both for use
sendEmail.verify = verifyTransporter;

module.exports = sendEmail;
