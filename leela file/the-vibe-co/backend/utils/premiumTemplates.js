/**
 * Premium Email & WhatsApp Templates for THE VIBE CO.
 * 
 * Templates are organized by audience:
 *   1. USERS      — Welcome, OTP (Password Reset)
 *   2. SERVICE MEMBERS (Providers) — Welcome + Credentials, Role Upgrade
 *   3. ADMINS     — Inquiry Alert, New Registration Alert, OTP (Admin Creation)
 *   4. WHATSAPP   — Inquiry Confirmation (sent to users)
 */

// ──────────────────────────────────────────────────────
// Shared Layout Components
// ──────────────────────────────────────────────────────

const header = `
  <div style="text-align: center; margin-bottom: 35px; padding-bottom: 30px; border-bottom: 1px solid rgba(201,168,76,0.15);">
    <h1 style="color: #C9A84C; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; letter-spacing: 7px; margin: 0; font-size: 34px; font-weight: bold; text-transform: uppercase;">THE VIBE CO.</h1>
    <p style="color: #8c8caf; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; margin: 8px 0 0 0; font-weight: 500;">Premium Event Services</p>
  </div>
`;

const footer = `
  <div style="margin-top: 45px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
    <p style="color: #555577; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; line-height: 1.8; margin: 0 0 15px 0;">
      This is an automated email from THE VIBE CO.<br/>
      If you did not expect this email, please ignore it or contact us at support.
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

// ──────────────────────────────────────────────────────
// 1. USER TEMPLATES
// ──────────────────────────────────────────────────────

/**
 * Welcome Email — Sent to new users after registration
 */
const welcomeTemplate = (name) => `
  <div style="${baseStyles}">
    ${header}
    <div style="text-align: center; margin: 25px 0;">
      <span style="font-size: 40px;">🎉</span>
    </div>
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px;">Welcome, ${name}!</h2>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: center; margin-bottom: 20px;">
      Thank you for joining <strong>THE VIBE CO.</strong> — your account has been successfully created.
    </p>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: center; margin-bottom: 35px;">
      You can now browse our premium event services, connect with top service providers, and start planning your next event.
    </p>
    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 16px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(201,168,76,0.3);">
        Log In to Your Account
      </a>
    </div>
    ${footer}
  </div>
`;

/**
 * OTP Email — Sent for password reset or admin creation verification
 */
const otpTemplate = (otp) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px;">Your Verification Code</h2>
    <p style="text-align: center; color: #a3a3c2; font-size: 14.5px; line-height: 1.6; margin-bottom: 35px;">
      Please enter the code below to complete your verification. <strong>Do not share this code</strong> with anyone.
    </p>
    <div style="background: rgba(201,168,76,0.05); border: 1px dashed rgba(201,168,76,0.4); padding: 30px; border-radius: 12px; text-align: center; margin: 0 40px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
      <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #C9A84C; text-shadow: 0 0 15px rgba(201,168,76,0.25); font-family: monospace;">${otp}</span>
    </div>
    <p style="text-align: center; color: #555577; font-size: 12px; margin-top: 40px;">
      This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
    </p>
    ${footer}
  </div>
`;

// ──────────────────────────────────────────────────────
// 2. SERVICE MEMBER (PROVIDER) TEMPLATES
// ──────────────────────────────────────────────────────

/**
 * Provider Welcome Email — Sent when a provider application is accepted (new account created)
 */
const providerWelcomeTemplate = (name, businessName, email, password) => `
  <div style="${baseStyles}">
    ${header}
    <div style="text-align: center; margin: 25px 0;">
      <span style="font-size: 40px;">🤝</span>
    </div>
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px;">Welcome to Our Team!</h2>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 20px;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 20px;">
      Congratulations! Your application for <strong>${businessName}</strong> has been reviewed and <strong style="color: #4caf50;">approved</strong> by THE VIBE CO. team.
    </p>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 25px;">
      Here are your login credentials to access the Service Provider Dashboard:
    </p>
    <div style="background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.25); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: left;">
      <h4 style="margin: 0 0 15px; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Your Login Details</h4>
      <p style="margin: 8px 0; color: #a3a3c2; font-size: 14px;">📧 <strong>Email:</strong> ${email}</p>
      <p style="margin: 8px 0; color: #a3a3c2; font-size: 14px;">🔑 <strong>Temporary Password:</strong> <span style="color: #C9A84C; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${password}</span></p>
    </div>
    <div style="background: rgba(255, 193, 7, 0.08); border: 1px solid rgba(255, 193, 7, 0.2); padding: 15px 20px; border-radius: 10px; margin-bottom: 25px;">
      <p style="margin: 0; color: #ffc107; font-size: 13px; font-weight: 600;">⚠️ Important: Please change your password after your first login for security.</p>
    </div>
    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 16px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(201,168,76,0.3);">
        Log In to Your Dashboard
      </a>
    </div>
    ${footer}
  </div>
`;

/**
 * Provider Upgrade Email — Sent when existing user's role is upgraded to provider
 */
const providerUpgradeTemplate = (name, businessName) => `
  <div style="${baseStyles}">
    ${header}
    <div style="text-align: center; margin: 25px 0;">
      <span style="font-size: 40px;">⬆️</span>
    </div>
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 24px; text-align: center; letter-spacing: 1px; margin-bottom: 25px;">Your Account Has Been Upgraded!</h2>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 20px;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 25px;">
      Great news! Your application for <strong>${businessName}</strong> has been <strong style="color: #4caf50;">approved</strong>. Your existing account has been upgraded to a <strong style="color: #C9A84C;">Service Provider</strong> role.
    </p>
    <div style="background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.25); padding: 25px; border-radius: 12px; margin: 20px 0;">
      <h4 style="margin: 0 0 15px; color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">What You Can Do Now</h4>
      <ul style="margin: 0; padding-left: 20px; color: #a3a3c2; font-size: 14px; line-height: 2;">
        <li>Manage your service listings and portfolio</li>
        <li>Receive and respond to client inquiries</li>
        <li>Chat directly with clients through the platform</li>
        <li>Track your bookings and reviews</li>
      </ul>
    </div>
    <p style="font-size: 14.5px; line-height: 1.8; color: #a3a3c2; text-align: left; margin-bottom: 35px;">
      Log in with your <strong>existing email and password</strong> — no changes are needed.
    </p>
    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 16px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(201,168,76,0.3);">
        Go to Your Dashboard
      </a>
    </div>
    ${footer}
  </div>
`;

// ──────────────────────────────────────────────────────
// 3. ADMIN TEMPLATES
// ──────────────────────────────────────────────────────

/**
 * Inquiry Alert Email — Sent to admin when a new booking inquiry is submitted
 */
const inquiryAdminTemplate = (contact) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 21px; border-left: 3px solid #C9A84C; padding-left: 20px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1.5px;">New Booking Inquiry</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Client Name:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px; font-weight: 500;">${contact.name}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Email:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px;">${contact.email}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Phone:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px;">${contact.phone || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Service Type:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14.5px; font-weight: 500; text-transform: capitalize;">${contact.eventType}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><strong style="color:#C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">Budget:</strong></td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #C9A84C; font-size: 15px; font-weight: bold;">${contact.budget || 'Not specified'}</td>
      </tr>
    </table>
    
    <div style="margin-top: 35px; padding: 25px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(201,168,76,0.15);">
      <h4 style="margin: 0 0 12px; color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Client's Message</h4>
      <p style="margin: 0; line-height: 1.7; font-size: 14px; color: #a3a3c2;">${contact.message}</p>
    </div>
    
    <div style="margin-top: 35px; text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
        View in Admin Panel
      </a>
    </div>
    <p style="font-size: 12px; color: #555577; text-align: center; margin-top: 15px;">A PDF copy of this inquiry has been attached to this email.</p>
    ${footer}
  </div>
`;

/**
 * New Registration Alert — Sent to admin when a new user signs up
 */
const adminRegistrationAlert = (userData) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 21px; border-left: 3px solid #4caf50; padding-left: 20px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1.5px;">New User Registered</h2>
    
    <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(201,168,76,0.15); margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Name</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${userData.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${userData.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${userData.phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">State</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${userData.state || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Registered</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
        View in Admin Panel
      </a>
    </div>
    ${footer}
  </div>
`;

/**
 * New Provider Application Alert — Sent to admin when someone applies as a provider
 */
const adminProviderApplicationAlert = (appData) => `
  <div style="${baseStyles}">
    ${header}
    <h2 style="color: #ffffff; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; font-weight: 400; font-size: 21px; border-left: 3px solid #4FC3F7; padding-left: 20px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1.5px;">New Provider Application</h2>
    
    <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(201,168,76,0.15); margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Contact Person</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${appData.contactPerson}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Business Name</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${appData.businessName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Service Type</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px; text-transform: capitalize;">${appData.serviceType?.replace(/_/g, ' ') || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${appData.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${appData.phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #C9A84C; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Location</td>
          <td style="padding: 10px 0; color: #fff; font-size: 14px;">${appData.city || ''}, ${appData.state || ''}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #a3a3c2; text-align: center; margin-top: 20px;">
      Review this application in the Admin Panel to approve or reject.
    </p>
    
    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
        Review Application
      </a>
    </div>
    ${footer}
  </div>
`;

// ──────────────────────────────────────────────────────
// 4. WHATSAPP TEMPLATES
// ──────────────────────────────────────────────────────

/**
 * WhatsApp Inquiry Confirmation — Sent to user after submitting a booking inquiry
 */
const whatsappTemplate = (name, eventType) => `
*THE VIBE CO.* ⚜️

Hello *${name}*,

✅ Your booking inquiry for *${eventType.toUpperCase()}* has been received successfully!

📋 *Status:* Under Review
⏱️ *Response Time:* Within 24 Hours

Our team will review your request and get back to you shortly.

Thank you for choosing THE VIBE CO.! 🥂
`;

module.exports = {
  welcomeTemplate,
  inquiryAdminTemplate,
  otpTemplate,
  whatsappTemplate,
  providerWelcomeTemplate,
  providerUpgradeTemplate,
  adminRegistrationAlert,
  adminProviderApplicationAlert
};
