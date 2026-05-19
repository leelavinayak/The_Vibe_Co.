const ProviderApplication = require('../models/ProviderApplication');
const Service = require('../models/Service');
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const sendWhatsAppMessage = require('../services/whatsappService');

// @desc    Submit a service provider application
// @route   POST /api/providers/apply
const applyAsProvider = async (req, res) => {
  try {
    const application = await ProviderApplication.create(req.body);

    // Notify Admin via Email
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@thevibeco.com',
        subject: `New Service Provider Application: ${application.businessName} ⚜️`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #d4d4e6; padding: 40px; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px;">
            <h1 style="color: #C9A84C; text-align: center;">New Partner Application</h1>
            <p><strong>Business:</strong> ${application.businessName}</p>
            <p><strong>Contact:</strong> ${application.contactPerson}</p>
            <p><strong>Service:</strong> ${application.serviceType}</p>
            <p><strong>Location:</strong> ${application.city}, ${application.state}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            <p><strong>Description:</strong> ${application.description}</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/admin/providers" style="background: #C9A84C; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Application</a>
            </div>
          </div>
        `,
        message: `New provider application from ${application.businessName}`
      });
    } catch (err) {
      console.error('Email notification failed:', err);
    }

    // Notify Admin via WhatsApp
    try {
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        await sendWhatsAppMessage(
          adminPhone,
          `⚜️ NEW PARTNER APPLICATION\n\nBusiness: ${application.businessName}\nContact: ${application.contactPerson}\nService: ${application.serviceType}\nCity: ${application.city}\n\nPlease check the admin dashboard to review.`
        );
      }
    } catch (err) {
      console.error('WhatsApp notification failed:', err);
    }

    // Confirmation to Applicant
    try {
      await sendEmail({
        email: application.email,
        subject: 'Application Received - THE VIBE CO. ⚜️',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #d4d4e6; padding: 40px; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; text-align: center;">
            <h1 style="color: #C9A84C;">Application Received</h1>
            <p>Hello ${application.contactPerson},</p>
            <p>Thank you for your interest in joining <strong>THE VIBE CO.</strong> elite partner network.</p>
            <p>Our team will review your application for <strong>${application.businessName}</strong> and contact you shortly regarding the next steps.</p>
            <p style="margin-top: 30px; font-size: 0.8rem; color: #7a7a99;">Best Regards,<br/>The Vibe Co. Selection Committee</p>
          </div>
        `,
        message: `Hi ${application.contactPerson}, your application for THE VIBE CO. has been received.`
      });
    } catch (err) {
      console.error('Applicant confirmation email failed:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Your application has been submitted successfully. Our team will contact you soon.'
    });
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

    // If application is accepted, create a new Service entry and User account
    if (newStatus === 'accepted' && oldStatus !== 'accepted') {
      try {
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
            priceStartsFrom: 'Contact for Quote',
            email: application.email,
            phone: application.phone,
            instagram: application.instagram || '',
            rating: 5,
            features: ['Newly Joined', 'Verified Partner'],
            images: allImages
          });
          console.log(`✅ Automatically created service listing for ${application.businessName}`);
        }

        // Create User account for the provider
        const existingUser = await User.findOne({ email: application.email });
        if (!existingUser) {
          const tempPassword = req.body.password || Math.random().toString(36).slice(-8); // Use admin-provided password or random
          const newUser = await User.create({
            name: application.contactPerson,
            email: application.email,
            password: tempPassword,
            role: 'provider',
            serviceId: service._id,
            phone: application.phone
          });

          // Send credentials email
          await sendEmail({
            email: application.email,
            subject: 'Account Accepted - THE VIBE CO. Partner Network ⚜️',
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #d4d4e6; padding: 40px; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; text-align: center;">
                <h1 style="color: #C9A84C;">Application Accepted</h1>
                <p>Hello ${application.contactPerson},</p>
                <p>We are pleased to inform you that <strong>your application has been accepted by the Admin</strong>. You can now start providing your services on our platform.</p>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: left;">
                  <p style="margin-top: 0;"><strong>Your Login Password:</strong></p>
                  <p>Email: ${application.email}</p>
                  <p>Password: <span style="color: #C9A84C; font-family: monospace; font-size: 1.2rem;">${tempPassword}</span></p>
                </div>
                <p>Please use the password above to login and start managing your services.</p>
                <div style="margin-top: 30px;">
                  <a href="${process.env.FRONTEND_URL}/login" style="background: #C9A84C; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Login & Start Services</a>
                </div>
              </div>
            `,
            message: `Your application has been accepted by the Admin. Use password: ${tempPassword} to login.`
          });
          console.log(`✅ Automatically created provider user for ${application.businessName}`);
        } else {
          // Update existing user to provider role if they exist
          existingUser.role = 'provider';
          existingUser.serviceId = service._id;
          await existingUser.save();
        }
      } catch (svcErr) {
        console.error('Failed to auto-create service/user:', svcErr);
      }
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyAsProvider,
  getApplications,
  updateApplicationStatus
};
