/**
 * Premium Email Templates for THE VIBE CO.
 * Follows the Matte Black & Gold Aesthetic
 */

const header = `
  <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid rgba(201,168,76,0.2);">
    <h1 style="color: #C9A84C; font-family: 'Playfair Display', Georgia, serif; letter-spacing: 6px; margin: 0; font-size: 32px; text-transform: uppercase;">THE VIBE CO.</h1>
    <p style="color: #7a7a99; font-size: 10px; letter-spacing: 5px; text-transform: uppercase; margin-top: 10px; font-weight: 400;">The Pinnacle of Event Orchestration</p>
  </div>
`;

const footer = `
  <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
    <p style="color: #555577; font-size: 12px; line-height: 1.6;">
      This is an automated communication from the premium concierge at THE VIBE CO.<br/>
      For urgent matters, please contact our support desk directly.
    </p>
    <div style="margin-top: 20px;">
      <span style="color: #C9A84C; font-size: 14px; font-weight: 700;">&copy; ${new Date().getFullYear()} THE VIBE CO. PRIVATE LIMITED</span>
    </div>
  </div>
`;

const baseStyles = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #050505;
  color: #d4d4e6;
  padding: 50px;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8);
`;

const welcomeTemplate = (name) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-weight: 300; font-size: 24px; margin-bottom: 25px;">Welcome to the Elite, ${name}</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #7a7a99;">
      We are delighted to confirm your registration with <strong>THE VIBE CO.</strong> You have just gained access to a world where precision meets passion.
    </p>
    <p style="font-size: 16px; line-height: 1.8; color: #7a7a99; margin-bottom: 35px;">
      Our platform is designed for those who settle for nothing less than extraordinary. You can now explore our curated service hub and begin orchestrating your next masterpiece.
    </p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'https://thevibeco.com'}" style="background: linear-gradient(135deg, #C9A84C, #967a2d); color: #000; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 10px 20px rgba(201,168,76,0.2);">Enter the Console</a>
    </div>
    ${footer}
  </div>
`;

const inquiryAdminTemplate = (contact) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-weight: 300; font-size: 22px; border-left: 3px solid #C9A84C; padding-left: 20px; margin-bottom: 30px;">New High-Performance Inquiry</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr><td style="padding: 15px 0; border-bottom: 1px solid #111;"><strong style="color:#C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Client Name:</strong></td><td style="padding: 15px 0; border-bottom: 1px solid #111; color: #fff;">${contact.name}</td></tr>
      <tr><td style="padding: 15px 0; border-bottom: 1px solid #111;"><strong style="color:#C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email:</strong></td><td style="padding: 15px 0; border-bottom: 1px solid #111; color: #fff;">${contact.email}</td></tr>
      <tr><td style="padding: 15px 0; border-bottom: 1px solid #111;"><strong style="color:#C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone:</strong></td><td style="padding: 15px 0; border-bottom: 1px solid #111; color: #fff;">${contact.phone}</td></tr>
      <tr><td style="padding: 15px 0; border-bottom: 1px solid #111;"><strong style="color:#C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Event:</strong></td><td style="padding: 15px 0; border-bottom: 1px solid #111; color: #fff;">${contact.eventType}</td></tr>
      <tr><td style="padding: 15px 0; border-bottom: 1px solid #111;"><strong style="color:#C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Budget:</strong></td><td style="padding: 15px 0; border-bottom: 1px solid #111; color: #C9A84C; font-weight: 700;">${contact.budget}</td></tr>
    </table>
    
    <div style="margin-top: 40px; padding: 25px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(201,168,76,0.1);">
      <h4 style="margin: 0 0 15px; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Requirement Brief</h4>
      <p style="margin: 0; line-height: 1.6; font-size: 14px; color: #7a7a99;">${contact.message}</p>
    </div>
    
    <div style="margin-top: 40px; text-align: center;">
      <p style="font-size: 13px; color: #555577;">A generated PDF brief is attached for your records.</p>
    </div>
    ${footer}
  </div>
`;

const otpTemplate = (otp) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-weight: 300; font-size: 24px; text-align: center; margin-bottom: 30px;">Verification Protocol</h2>
    <p style="text-align: center; color: #7a7a99; font-size: 16px; margin-bottom: 40px;">
      Please use the following unique authorization code to proceed with your request.
    </p>
    <div style="background: rgba(201,168,76,0.1); border: 2px dashed #C9A84C; padding: 30px; border-radius: 20px; text-align: center; margin: 0 50px;">
      <span style="font-size: 48px; font-weight: 900; letter-spacing: 15px; color: #C9A84C; text-shadow: 0 0 20px rgba(201,168,76,0.3); font-family: monospace;">${otp}</span>
    </div>
    <p style="text-align: center; color: #555577; font-size: 12px; margin-top: 40px;">
      This code is valid for a limited window of 10 minutes.
    </p>
    ${footer}
  </div>
`;

const whatsappTemplate = (name, eventType) => `
*THE VIBE CO.* ⚜️

Hello *${name}*, 

Your premium inquiry for *${eventType}* has been successfully received by our orchestration team. 

Our concierge will review your requirements and reach out to you within 24 hours.

Thank you for choosing the pinnacle of events.
_Experience the Extraordinary._
`;

module.exports = {
  welcomeTemplate,
  inquiryAdminTemplate,
  otpTemplate,
  whatsappTemplate
};
