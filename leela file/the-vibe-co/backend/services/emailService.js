const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // For demo/development purposes, we will mock the email sending
  // If you have real SMTP credentials, you can put them in .env
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the default service
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'THE VIBE CO.'} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments || []
  };

  try {
    console.log(`[Email Service] Attempting to send real email to ${options.email}`);
    await transporter.sendMail(message);
    console.log(`[Email Service] Email sent successfully to ${options.email}.`);
  } catch (error) {
    console.error(`[Email Service] Error sending email: ${error.message}`);
    console.error('Make sure you have added your Gmail address and App Password in the backend/.env file!');
  }
};

module.exports = sendEmail;
