/**
 * Premium Email & WhatsApp Templates for THE VIBE CO.
 * Follows the Elite Matte Black, Charcoal & Pure Gold (#C9A84C) Aesthetic.
 */

const header = `
  <div style="text-align: center; margin-bottom: 35px; padding-bottom: 30px; border-bottom: 1px solid rgba(201,168,76,0.15);">
    <h1 style="color: #C9A84C; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; letter-spacing: 7px; margin: 0; font-size: 34px; font-weight: bold; text-transform: uppercase;">THE VIBE CO.</h1>
    <p style="color: #8c8caf; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; margin: 8px 0 0 0; font-weight: 500;">The Pinnacle of Luxury Event Orchestration</p>
  </div>
`;

const footer = `
  <div style="margin-top: 45px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
    <p style="color: #555577; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; line-height: 1.8; margin: 0 0 15px 0; font-style: italic;">
      This is a secure, automated dispatch from the private concierge of THE VIBE CO.<br/>
      If you did not initiate this communication, please secure your credentials immediately.
    </p>
    <div style="margin-top: 20px;">
      <span style="color: #C9A84C; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1px;">⚜️ &copy; ${new Date().getFullYear()} THE VIBE CO. All Rights Reserved.</span>
    </div>
  </div>
`;

const baseStyles = `
  font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #050505;
  color: #d4d4e6;
  padding: 45px;
  border-radius: 20px;
  border: 1px solid rgba(201,168,76,0.25);
  box-shadow: 0 25px 60px rgba(0,0,0,0.9);
`;

/**
 * Premium Welcome Email Template
 */
const welcomeTemplate = (name) => `
  <div style="${baseStyles}">
    ${header}
    <div style="text-align: center; margin: 25px 0;">
      <span style="font-size: 40px;">⚜️</span>
    </div>
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px; text-transform: uppercase;">Welcome to the Elite, ${name}</h2>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: justify; margin-bottom: 20px;">
      We are delighted to confirm your registration with <strong>THE VIBE CO.</strong> You have just gained entrance into an ultra-exclusive circle where vision meets immaculate orchestration.
    </p>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: justify; margin-bottom: 35px;">
      Our platform is strictly dedicated to individuals who demand the extraordinary. You can now explore our high-end service marketplace, connect directly with elite service members, and begin designing your next masterpiece.
    </p>
    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 16px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(201,168,76,0.3);">
        Enter the Console
      </a>
    </div>
    ${footer}
  </div>
`;

/**
 * Premium Admin Inquiry Alert Email Template
 */
const inquiryAdminTemplate = (contact) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 21px; border-left: 3px solid #C9A84C; padding-left: 20px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1.5px;">New Orchestration Request</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Client Name:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px; font-weight: 500;">${contact.name}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Email ID:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px;">${contact.email}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Phone Number:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px;">${contact.phone || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Event Type:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px; font-weight: 500; text-transform: uppercase;">${contact.eventType}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Est. Budget:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #C9A84C; font-size: 15px; font-weight: bold;">${contact.budget || 'Custom Quote Requested'}</td>
      </tr>
    </table>
    
    <div style="margin-top: 35px; padding: 25px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(201,168,76,0.15);">
      <h4 style="margin: 0 0 12px; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Requirement Brief</h4>
      <p style="margin: 0; line-height: 1.7; font-size: 14px; color: #a3a3c2;">${contact.message}</p>
    </div>
    
    <div style="margin-top: 35px; text-align: center;">
      <p style="font-size: 12px; color: #555577;">An elegant PDF dossier containing the full brief has been generated and attached.</p>
    </div>
    ${footer}
  </div>
`;

/**
 * Premium OTP Verification Email Template
 */
const otpTemplate = (otp) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px; text-transform: uppercase;">Verification Protocol</h2>
    <p style="text-align: center; color: #a3a3c2; font-size: 14.5px; line-height: 1.6; margin-bottom: 35px;">
      Please input the secure validation code below into your orchestration console to complete your authentication request.
    </p>
    <div style="background: rgba(201,168,76,0.05); border: 1px dashed rgba(201,168,76,0.4); padding: 30px; border-radius: 12px; text-align: center; margin: 0 40px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
      <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #C9A84C; text-shadow: 0 0 15px rgba(201,168,76,0.25); font-family: monospace;">${otp}</span>
    </div>
    <p style="text-align: center; color: #555577; font-size: 12px; margin-top: 40px;">
      This security token is highly confidential and will expire automatically in 10 minutes.
    </p>
    ${footer}
  </div>
`;

/**
 * Premium WhatsApp Message Template (User Confirmation)
 */
const whatsappTemplate = (name, eventType) => `
*THE VIBE CO.* ⚜️

Hello *${name}*, 

✨ Your premium orchestration request for *${eventType.toUpperCase()}* has been successfully received by our concierge committee. 

💼 *Status:* Under Selection Committee Review
⏱️ *Concierge Timeline:* Within 24 Hours

An elite representative will review your request specifications and connect with you shortly. 

Thank you for choosing the pinnacle of event orchestration.
_Experience the Extraordinary._ 🥂
`;

module.exports = {
  welcomeTemplate,
  inquiryAdminTemplate,
  otpTemplate,
  whatsappTemplate
};
