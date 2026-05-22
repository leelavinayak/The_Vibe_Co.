const nodemailer = require('nodemailer');

let transporter = null;
let transporterVerified = false;
let lastVerifiedAt = 0;

// Re-verify the transporter every 4 minutes to prevent stale connections
// Gmail closes idle SMTP connections after ~5 minutes
const VERIFY_INTERVAL_MS = 4 * 60 * 1000;

const createNewTransporter = () => {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim() : '';

  if (!smtpEmail || !smtpPassword) {
    console.error('❌ [Email Service] SMTP_EMAIL or SMTP_PASSWORD is missing in .env file!');
    return null;
  }

  return nodemailer.createTransport({
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
    pool: true,              // Use pooled connections for better reliability
    maxConnections: 3,       // Allow up to 3 simultaneous connections
    maxMessages: 50,         // Create new connection after 50 messages
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = createNewTransporter();
  return transporter;
};

const resetTransporter = () => {
  if (transporter) {
    try {
      transporter.close();
    } catch (e) {
      // Ignore close errors
    }
  }
  transporter = null;
  transporterVerified = false;
  lastVerifiedAt = 0;
};

const verifyTransporter = async () => {
  const now = Date.now();

  // Skip re-verification if recently verified and transporter exists
  if (transporterVerified && transporter && (now - lastVerifiedAt) < VERIFY_INTERVAL_MS) {
    return true;
  }

  const t = getTransporter();
  if (!t) return false;

  try {
    await t.verify();
    transporterVerified = true;
    lastVerifiedAt = now;
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
    // Reset transporter so it can be recreated with new credentials/connection
    resetTransporter();
    return false;
  }
};

const sendEmail = async (options, retryCount = 0) => {
  const maxRetries = 2;

  try {
    // Verify connection (will re-verify if stale)
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      console.error(`❌ [Email Service] Cannot send email to ${options.email} - SMTP not configured properly.`);
      return false;
    }

    const t = getTransporter();
    if (!t) {
      console.error(`❌ [Email Service] Cannot send email to ${options.email} - transporter is null.`);
      return false;
    }

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

    // Determine if the error is a connection/transient issue
    const isConnectionError = [
      'ECONNECTION', 'ESOCKET', 'ETIMEDOUT', 'ECONNRESET',
      'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'EAI_AGAIN'
    ].includes(error.code) ||
      error.message?.includes('socket') ||
      error.message?.includes('connect') ||
      error.message?.includes('closed') ||
      error.message?.includes('ECONNRESET') ||
      error.message?.includes('timeout');

    if (error.code === 'EAUTH') {
      console.error('   → Gmail App Password is INVALID or EXPIRED. Please regenerate it.');
      console.error('   → Go to: https://myaccount.google.com/apppasswords');
    }

    // Reset transporter on any connection-related error so next attempt creates a fresh one
    if (isConnectionError || error.code === 'EAUTH') {
      resetTransporter();
    }

    // Retry on transient/connection errors
    if (retryCount < maxRetries && isConnectionError) {
      const delay = 2000 * (retryCount + 1);
      console.log(`🔄 [Email Service] Retrying in ${delay}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmail(options, retryCount + 1);
    }

    return false;
  }
};

// Export both for use
sendEmail.verify = verifyTransporter;

module.exports = sendEmail;
