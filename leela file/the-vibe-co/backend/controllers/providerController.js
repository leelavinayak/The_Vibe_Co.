const ProviderApplication = require('../models/ProviderApplication');
const Service = require('../models/Service');
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const sendWhatsAppMessage = require('../services/whatsappService');
const { providerWelcomeTemplate, providerUpgradeTemplate, adminProviderApplicationAlert } = require('../utils/premiumTemplates');

const applyAsProvider = async (req, res) => {
  try {
    const application = await ProviderApplication.create(req.body);

    // Send response immediately
    res.status(201).json({
      success: true,
      message: 'Your application has been submitted successfully. Our team will contact you soon.'
    });

    // Run all notifications in the background AFTER response is sent
    (async () => {
      try {
        console.log(`\n📋 [Provider Application] Sending notifications for ${application.businessName}...`);

        // 1. Notify Admin via Email
        const emailResult1 = await sendEmail({
          email: process.env.ADMIN_EMAIL || 'admin@thevibeco.com',
          subject: `New Service Provider Application: ${application.businessName} ⚜️`,
          html: adminProviderApplicationAlert(application),
          message: `New provider application from ${application.businessName}`
        });
        console.log(`📧 [Provider Application] Admin email: ${emailResult1 ? '✅ Sent' : '❌ Failed'}`);

        // 2. Notify Admin via WhatsApp
        const adminPhone = process.env.ADMIN_PHONE;
        if (adminPhone) {
          const waResult1 = await sendWhatsAppMessage(
            adminPhone,
            `⚜️ NEW PROVIDER APPLICATION\n\nBusiness: ${application.businessName}\nContact: ${application.contactPerson}\nService: ${application.serviceType?.replace(/_/g, ' ')}\nStarting Price: ₹${application.startingPrice}\nCity: ${application.city}\n\nPlease check the admin dashboard to review.`
          );
          console.log(`📱 [Provider Application] Admin WhatsApp: ${waResult1 ? '✅ Sent' : '❌ Failed'}`);
        }

        // 3. Confirmation Email to Applicant
        const emailResult2 = await sendEmail({
          email: application.email,
          subject: 'Application Received - THE VIBE CO. ⚜️',
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #d4d4e6; padding: 45px; border: 1px solid rgba(201,168,76,0.25); border-radius: 20px; text-align: center;">
              <h1 style="color: #C9A84C; font-size: 28px; letter-spacing: 5px; margin-bottom: 5px;">THE VIBE CO.</h1>
              <p style="color: #8c8caf; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px;">Premium Event Services</p>
              <div style="border-top: 1px solid rgba(201,168,76,0.15); padding-top: 30px;">
                <span style="font-size: 40px;">📋</span>
                <h2 style="color: #fff; font-size: 22px; margin: 20px 0 15px;">Application Received!</h2>
                <p style="color: #a3a3c2; font-size: 14.5px; line-height: 1.8;">Hello <strong>${application.contactPerson}</strong>,</p>
                <p style="color: #a3a3c2; font-size: 14.5px; line-height: 1.8;">Thank you for applying to join <strong>THE VIBE CO.</strong> as a service provider.</p>
                <p style="color: #a3a3c2; font-size: 14.5px; line-height: 1.8;">We have received your application for <strong>${application.businessName}</strong> (${application.serviceType?.replace(/_/g, ' ')}) and our team will review it shortly.</p>
                <div style="background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.2); padding: 20px; border-radius: 12px; margin: 25px 0; text-align: left;">
                  <p style="margin: 5px 0; color: #a3a3c2; font-size: 13px;">📋 <strong>Status:</strong> Under Review</p>
                  <p style="margin: 5px 0; color: #a3a3c2; font-size: 13px;">⏱️ <strong>Expected Response:</strong> Within 48 hours</p>
                </div>
                <p style="color: #7a7a99; font-size: 13px; margin-top: 25px;">We'll notify you via email and WhatsApp once your application is processed.</p>
                <p style="color: #555577; font-size: 12px; margin-top: 30px;">Best Regards,<br/>THE VIBE CO. Team</p>
              </div>
            </div>
          `,
          message: `Hi ${application.contactPerson}, your application for THE VIBE CO. has been received.`
        });
        console.log(`📧 [Provider Application] Applicant confirmation email to ${application.email}: ${emailResult2 ? '✅ Sent' : '❌ Failed'}`);

        // 4. Confirmation WhatsApp to Applicant
        if (application.phone) {
          const waResult2 = await sendWhatsAppMessage(
            application.phone,
            `*THE VIBE CO.* ⚜️\n\nHello *${application.contactPerson}*,\n\nThank you for applying to join THE VIBE CO. as a service provider!\n\n📋 Your application for *${application.businessName}* (${application.serviceType?.replace(/_/g, ' ')}) has been received.\n\n⏱️ Our team will review it and get back to you within 48 hours.\n\nBest Regards,\nTHE VIBE CO. Team`
          );
          console.log(`📱 [Provider Application] Applicant WhatsApp to ${application.phone}: ${waResult2 ? '✅ Sent' : '❌ Failed'}`);
        }

        console.log(`✅ [Provider Application] All notifications completed for ${application.businessName}\n`);
      } catch (bgError) {
        console.error('❌ [Provider Application] Background notification error:', bgError.message);
      }
    })();
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all provider applications (Admin only)
// @route   GET /api/providers/applications
const getApplications = async (req, res) => {
  try {
    const applications = await ProviderApplication.find({ status: { $ne: 'accepted' } }).sort('-createdAt');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/providers/applications/:id
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await ProviderApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const oldStatus = application.status;
    const newStatus = req.body.status;

    application.status = newStatus || application.status;
    await application.save();

    // Send response immediately
    res.json({ success: true, application });

    // If application is accepted, create service + user and send notifications in background
    if (newStatus === 'accepted' && oldStatus !== 'accepted') {
      (async () => {
        try {
          console.log(`\n⚜️ [Provider Acceptance] Processing acceptance for ${application.businessName}...`);

          // Check if service already exists
          let service = await Service.findOne({ email: application.email });
          if (!service) {
            const allImages = [];
            if (application.logo) allImages.push(application.logo);
            if (application.images && application.images.length > 0) {
              allImages.push(...application.images);
            }

            service = await Service.create({
              name: application.businessName,
              type: application.serviceType,
              state: application.state,
              city: application.city,
              description: application.description,
              priceStartsFrom: `₹${application.startingPrice || 'Contact for Quote'}`,
              email: application.email,
              phone: application.phone,
              instagram: application.instagram || '',
              rating: 5,
              features: ['Newly Joined', 'Verified Partner'],
              images: allImages
            });
            console.log(`✅ [Provider Acceptance] Created service listing for ${application.businessName}`);
          }

          // Create User account for the provider
          const existingUser = await User.findOne({ email: application.email });
          if (!existingUser) {
            const tempPassword = req.body.password || Math.random().toString(36).slice(-8);
            const newUser = await User.create({
              name: application.contactPerson,
              email: application.email,
              password: tempPassword,
              role: 'provider',
              serviceId: service._id,
              phone: application.phone
            });
            console.log(`✅ [Provider Acceptance] Created provider user for ${application.businessName}`);

            // Send credentials email
            const emailResult = await sendEmail({
              email: application.email,
              subject: 'Account Accepted - THE VIBE CO. Partner Network ⚜️',
              html: providerWelcomeTemplate(application.contactPerson, application.businessName, application.email, tempPassword),
              message: `Your application has been accepted by the Admin. Use password: ${tempPassword} to login.`
            });
            console.log(`📧 [Provider Acceptance] Credentials email to ${application.email}: ${emailResult ? '✅ Sent' : '❌ Failed'}`);

            // Send credentials via WhatsApp
            if (application.phone) {
              const waResult = await sendWhatsAppMessage(
                application.phone,
                `*THE VIBE CO.* ⚜️\n\nHello *${application.contactPerson}*,\n\nCongratulations! 🥂 Your application for *${application.businessName}* has been *ACCEPTED*! You are now an elite partner on THE VIBE CO.\n\n*Your Login Credentials:*\n📧 Email: ${application.email}\n🔑 Password: ${tempPassword}\n\n🔗 Login here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login\n\nPlease change your password after your first login.\n\nBest Regards,\nTHE VIBE CO.`
              );
              console.log(`📱 [Provider Acceptance] Credentials WhatsApp to ${application.phone}: ${waResult ? '✅ Sent' : '❌ Failed'}`);
            }
          } else {
            // Update existing user to provider role
            existingUser.role = 'provider';
            existingUser.serviceId = service._id;
            await existingUser.save();
            console.log(`✅ [Provider Acceptance] Upgraded existing user ${existingUser.email} to provider role`);

            // Send acceptance email & WhatsApp to existing user
            const emailResult = await sendEmail({
              email: application.email,
              subject: 'Application Accepted - THE VIBE CO. Partner Network ⚜️',
              html: providerUpgradeTemplate(application.contactPerson, application.businessName),
              message: `Your application has been accepted by the Admin. Your existing account has been upgraded to partner role.`
            });
            console.log(`📧 [Provider Acceptance] Upgrade email to ${application.email}: ${emailResult ? '✅ Sent' : '❌ Failed'}`);

            if (application.phone) {
              const waResult = await sendWhatsAppMessage(
                application.phone,
                `*THE VIBE CO.* ⚜️\n\nHello *${application.contactPerson}*,\n\nCongratulations! 🥂 Your application for *${application.businessName}* has been *ACCEPTED*!\n\nSince you already have an account, your role has been upgraded to Partner/Provider.\n\n🔗 Login: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login\n\nBest Regards,\nTHE VIBE CO.`
              );
              console.log(`📱 [Provider Acceptance] Upgrade WhatsApp to ${application.phone}: ${waResult ? '✅ Sent' : '❌ Failed'}`);
            }
          }

          console.log(`✅ [Provider Acceptance] All processing completed for ${application.businessName}\n`);
        } catch (bgError) {
          console.error('❌ [Provider Acceptance] Background processing error:', bgError.message);
        }
      })();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyAsProvider,
  getApplications,
  updateApplicationStatus
};
