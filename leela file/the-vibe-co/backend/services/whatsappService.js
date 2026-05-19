const twilio = require('twilio');

let twilioClient = null;
let twilioVerified = false;

const getClient = () => {
  if (twilioClient) return twilioClient;

  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.error('❌ [WhatsApp Service] TWILIO_SID or TWILIO_AUTH_TOKEN is missing in .env!');
    return null;
  }

  twilioClient = twilio(sid, token);
  return twilioClient;
};

const verifyTwilio = async () => {
  if (twilioVerified) return true;

  const client = getClient();
  if (!client) return false;

  try {
    // Verify credentials by fetching account info
    const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
    console.log(`✅ [WhatsApp Service] Twilio account verified! Status: ${account.status}, Name: ${account.friendlyName}`);

    if (account.status === 'suspended') {
      console.error('❌ [WhatsApp Service] Your Twilio account is SUSPENDED! Reactivate it at https://www.twilio.com/console');
      return false;
    }

    if (account.status === 'closed') {
      console.error('❌ [WhatsApp Service] Your Twilio account is CLOSED!');
      return false;
    }

    twilioVerified = true;
    return true;
  } catch (error) {
    console.error('❌ [WhatsApp Service] Twilio verification FAILED:', error.message);
    if (error.code === 20003) {
      console.error('   → Your TWILIO_SID or TWILIO_AUTH_TOKEN is INVALID.');
      console.error('   → Get correct credentials from: https://console.twilio.com/');
    }
    twilioClient = null;
    return false;
  }
};

const formatPhoneNumber = (phone, prefix = 'whatsapp:') => {
  let str = phone.toString().trim();
  if (str.startsWith(prefix)) return str;

  // Remove all non-digit characters
  const digits = str.replace(/\D/g, '');

  // Indian numbers: 10 digits → add +91
  if (digits.length === 10) {
    return `${prefix}+91${digits}`;
  }
  // Already has country code
  return `${prefix}+${digits}`;
};

const sendWhatsAppMessage = async (phone, message, retryCount = 0) => {
  const maxRetries = 1;

  try {
    const client = getClient();
    if (!client) {
      console.error('❌ [WhatsApp Service] Twilio client not available. Check credentials in .env');
      return false;
    }

    const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+14155238886';
    const toStr = formatPhoneNumber(phone);
    const fromStr = formatPhoneNumber(fromPhone);

    console.log(`📱 [WhatsApp Service] Sending to: ${toStr} | From: ${fromStr}`);
    console.log(`💬 [WhatsApp Service] Message preview: ${message.substring(0, 100)}...`);

    const result = await client.messages.create({
      body: message,
      from: fromStr,
      to: toStr
    });

    console.log(`✅ [WhatsApp Service] Message sent! SID: ${result.sid} | Status: ${result.status}`);
    return true;
  } catch (error) {
    console.error(`❌ [WhatsApp Service] Error sending to ${phone}:`, error.message);

    // Detailed error handling based on Twilio error codes
    if (error.code === 20003) {
      console.error('   → Invalid Twilio credentials. Update TWILIO_SID and TWILIO_AUTH_TOKEN in .env');
      twilioClient = null;
      twilioVerified = false;
    } else if (error.code === 20404) {
      console.error('   → Twilio resource not found. Check your TWILIO_PHONE_NUMBER in .env');
    } else if (error.code === 63007) {
      console.error('   → WhatsApp Sandbox: Recipient has NOT joined the sandbox!');
      console.error(`   → Ask the recipient (${phone}) to send "join <your-keyword>" to WhatsApp: ${process.env.TWILIO_PHONE_NUMBER || '+14155238886'}`);
      console.error('   → Find your sandbox keyword at: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    } else if (error.code === 63003) {
      console.error('   → WhatsApp: Channel not found or not enabled. Enable WhatsApp in Twilio console.');
    } else if (error.code === 21608) {
      console.error('   → Twilio: The "From" phone number is not a valid WhatsApp-enabled sender.');
      console.error('   → For sandbox, use: +14155238886');
    } else if (error.code === 21211) {
      console.error(`   → Invalid "To" phone number: ${phone}. Make sure it includes country code.`);
    } else if (error.message && error.message.includes('daily messages limit')) {
      console.error('   → ⚠️ TWILIO DAILY MESSAGE LIMIT (50/day) EXCEEDED on trial/sandbox account!');
      console.error('   → WhatsApp messages will NOT be sent until the limit resets (midnight UTC).');
      console.error('   → To fix permanently: Upgrade your Twilio account at https://www.twilio.com/console/billing');
      console.error('   → A paid account removes the 50/day limit.');
    } else if (error.code === 20429 || error.status === 429) {
      console.error('   → Twilio rate limit exceeded. Too many messages sent too quickly.');
      if (retryCount < maxRetries) {
        console.log(`🔄 [WhatsApp Service] Retrying after delay... (attempt ${retryCount + 2})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return sendWhatsAppMessage(phone, message, retryCount + 1);
      }
    } else if (error.code === 21614) {
      console.error(`   → Phone number ${phone} is not a valid mobile number or not capable of receiving WhatsApp.`);
    }

    return false;
  }
};

// Export both for use
sendWhatsAppMessage.verify = verifyTwilio;

module.exports = sendWhatsAppMessage;
