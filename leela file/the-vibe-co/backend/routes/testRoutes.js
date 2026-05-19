const express = require('express');
const router = express.Router();

// @desc    Test email service
// @route   POST /api/test/email
router.post('/email', async (req, res) => {
  try {
    const sendEmail = require('../services/emailService');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address in the request body' });
    }

    console.log(`\n🧪 [TEST] Sending test email to: ${email}`);

    const result = await sendEmail({
      email,
      subject: 'Test Email from THE VIBE CO. ⚜️',
      message: 'This is a test email to verify the email service is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #C9A84C; border-radius: 10px; text-align: center;">
          <h2 style="color: #C9A84C;">✅ Email Service Working!</h2>
          <p>This is a test email from <strong>THE VIBE CO.</strong></p>
          <p>If you received this, your email configuration is correct.</p>
          <p style="color: #777; font-size: 0.8rem; margin-top: 20px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    if (result) {
      res.json({ success: true, message: `✅ Test email sent successfully to ${email}. Check the inbox (and spam folder).` });
    } else {
      res.status(500).json({ success: false, message: '❌ Email sending failed. Check server console for detailed error messages.' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Test WhatsApp service
// @route   POST /api/test/whatsapp
router.post('/whatsapp', async (req, res) => {
  try {
    const sendWhatsAppMessage = require('../services/whatsappService');
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a phone number in the request body' });
    }

    console.log(`\n🧪 [TEST] Sending test WhatsApp to: ${phone}`);

    const result = await sendWhatsAppMessage(
      phone,
      `✅ THE VIBE CO. WhatsApp Test\n\nThis is a test message to verify that WhatsApp messaging is working correctly.\n\nSent at: ${new Date().toLocaleString()}`
    );

    if (result) {
      res.json({ success: true, message: `✅ Test WhatsApp sent successfully to ${phone}` });
    } else {
      res.status(500).json({
        success: false,
        message: '❌ WhatsApp sending failed. Check server console for detailed error messages.',
        troubleshooting: [
          '1. Make sure the recipient has joined the Twilio WhatsApp Sandbox',
          '2. Send "join <your-keyword>" to WhatsApp: +14155238886 from the recipient phone',
          '3. Find your sandbox keyword at: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn',
          '4. Sandbox sessions expire after 72 hours — rejoin if expired',
          '5. Verify Twilio credentials (SID & Auth Token) are correct in .env'
        ]
      });
    }
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Verify all notification services
// @route   GET /api/test/verify
router.get('/verify', async (req, res) => {
  const results = {};

  // Verify Email
  try {
    const sendEmail = require('../services/emailService');
    results.email = await sendEmail.verify();
  } catch (error) {
    results.email = false;
    results.emailError = error.message;
  }

  // Verify WhatsApp
  try {
    const sendWhatsAppMessage = require('../services/whatsappService');
    results.whatsapp = await sendWhatsAppMessage.verify();
  } catch (error) {
    results.whatsapp = false;
    results.whatsappError = error.message;
  }

  // Environment check
  results.config = {
    SMTP_EMAIL: process.env.SMTP_EMAIL ? '✅ Set' : '❌ Missing',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Missing',
    TWILIO_SID: process.env.TWILIO_SID ? '✅ Set' : '❌ Missing',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '❌ Missing (will use default sandbox)',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '❌ Missing',
    ADMIN_PHONE: process.env.ADMIN_PHONE || '❌ Missing'
  };

  const allWorking = results.email && results.whatsapp;

  res.json({
    success: allWorking,
    message: allWorking ? '✅ All notification services are working!' : '⚠️ Some services have issues. See details below.',
    results
  });
});

module.exports = router;
