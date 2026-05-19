const twilio = require('twilio');

const sendWhatsAppMessage = async (phone, message) => {
  try {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+14155238886';
    
    console.log(`\n=================================================`);
    console.log(`📱 [WhatsApp/SMS Service] Attempting to send message to: ${phone}`);
    console.log(`💬 Content: ${message}`);
    console.log(`=================================================\n`);

    if (sid && token) {
      const client = twilio(sid, token);
      
      // Ensure phone numbers are correctly formatted for WhatsApp
      let toStr = phone.toString().trim();
      if (!toStr.startsWith('whatsapp:')) {
        const digits = toStr.replace(/\D/g, '');
        if (digits.length === 10) {
          toStr = `whatsapp:+91${digits}`;
        } else {
          toStr = `whatsapp:+${digits}`;
        }
      }
      
      let fromStr = fromPhone.toString().trim();
      if (!fromStr.startsWith('whatsapp:')) {
        const digits = fromStr.replace(/\D/g, '');
        fromStr = `whatsapp:+${digits}`;
      }
      
      await client.messages.create({
        body: message,
        from: fromStr,
        to: toStr
      });
      console.log('✅ Message sent via Twilio successfully.');
    } else {
      console.log('⚠️ Twilio credentials (TWILIO_SID, TWILIO_AUTH_TOKEN) missing in .env. Skipped sending real SMS/WhatsApp.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp/SMS:', error.message);
    // We do not throw the error so that the contact submission still succeeds
    return false;
  }
};

module.exports = sendWhatsAppMessage;
