const mongoose = require('mongoose');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const Service = require('../models/Service');
const sendEmail = require('../services/emailService');
const { otpTemplate } = require('../utils/premiumTemplates');

const adminOTPs = new Map(); // Simple in-memory OTP store: adminId -> { otp, expires }

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('serviceId', 'name type city').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user details with history
// @route   GET /api/admin/users/:id
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('serviceId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const inquiries = await Contact.find({
      $or: [{ user: user._id }, { email: user.email }]
    })
      .populate('service', 'name type city')
      .sort('-createdAt');

    res.json({
      user,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;
      user.state = req.body.state !== undefined ? req.body.state : user.state;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      user.country = req.body.country !== undefined ? req.body.country : user.country;
      user.language = req.body.language !== undefined ? req.body.language : user.language;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

      // Update associated service details if passed
      if (req.body.serviceDetails && user.serviceId) {
        const service = await Service.findById(user.serviceId);
        if (service) {
          service.name = req.body.serviceDetails.name !== undefined ? req.body.serviceDetails.name : service.name;
          service.type = req.body.serviceDetails.type !== undefined ? req.body.serviceDetails.type : service.type;
          service.description = req.body.serviceDetails.description !== undefined ? req.body.serviceDetails.description : service.description;
          service.priceStartsFrom = req.body.serviceDetails.priceStartsFrom !== undefined ? req.body.serviceDetails.priceStartsFrom : service.priceStartsFrom;
          service.state = req.body.serviceDetails.state !== undefined ? req.body.serviceDetails.state : service.state;
          service.city = req.body.serviceDetails.city !== undefined ? req.body.serviceDetails.city : service.city;
          service.phone = req.body.serviceDetails.phone !== undefined ? req.body.serviceDetails.phone : service.phone;
          service.email = req.body.serviceDetails.email !== undefined ? req.body.serviceDetails.email : service.email;
          service.instagram = req.body.serviceDetails.instagram !== undefined ? req.body.serviceDetails.instagram : service.instagram;
          if (req.body.serviceDetails.features !== undefined) {
            service.features = Array.isArray(req.body.serviceDetails.features)
              ? req.body.serviceDetails.features
              : req.body.serviceDetails.features.split(',').map(f => f.trim()).filter(Boolean);
          }
          await service.save();
        }
      }

      const updatedUser = await user.save();
      const populatedUser = await User.findById(updatedUser._id).populate('serviceId');
      res.json(populatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, state, country, language, gender } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'defaultpassword123',
      role: role || 'user',
      phone,
      state,
      country,
      language,
      gender
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if provider and handle related data
    if (user.role === 'provider') {
      // 1. Delete by serviceId ref on User model
      if (user.serviceId) {
        await Service.findByIdAndDelete(user.serviceId);
        console.log(`[Delete User] Deleted Service by serviceId: ${user.serviceId}`);
      }
      
      // 2. Fallback: Delete by matching email in Service model
      if (user.email) {
        const deletedByEmail = await Service.findOneAndDelete({ email: user.email });
        if (deletedByEmail) {
          console.log(`[Delete User] Deleted Service by matching email: ${user.email}`);
        }
      }

      // 3. Fallback: Delete by matching phone in Service model
      if (user.phone) {
        const deletedByPhone = await Service.findOneAndDelete({ phone: user.phone });
        if (deletedByPhone) {
          console.log(`[Delete User] Deleted Service by matching phone: ${user.phone}`);
        }
      }

      // 4. Clean up any ProviderApplication associated with this email
      if (user.email) {
        try {
          const ProviderApplication = require('../models/ProviderApplication');
          await ProviderApplication.deleteMany({ email: user.email });
          console.log(`[Delete User] Cleaned up ProviderApplications for: ${user.email}`);
        } catch (appErr) {
          console.error('[Delete User] Error cleaning up ProviderApplications:', appErr);
        }
      }
    }

    // Extra safety measure: Delete any remaining services matching email
    if (user.email) {
      await Service.deleteMany({ email: user.email.toLowerCase().trim() });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and associated service data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Init create admin (send OTP)
// @route   POST /api/admin/users/create-admin-init
const createAdminInit = async (req, res) => {
  try {
    const adminEmail = process.env.SMTP_EMAIL || process.env.ADMIN_EMAIL;
    if (!adminEmail) return res.status(500).json({ message: 'Admin email not configured' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    adminOTPs.set(req.user._id.toString(), {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    await sendEmail({
      email: adminEmail,
      subject: 'Admin Creation Authorization OTP - THE VIBE CO. ⚜️',
      html: otpTemplate(otp),
      message: `Your OTP for authorizing new admin creation is: ${otp}`
    });

    res.json({ message: `OTP sent successfully to configured system email`, email: adminEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and create admin
// @route   POST /api/admin/users/create-admin
const createAdminVerify = async (req, res) => {
  try {
    const { otp, name, email, password, phone } = req.body;
    const otpRecord = adminOTPs.get(req.user._id.toString());

    if (!otpRecord || otpRecord.otp !== otp || Date.now() > otpRecord.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name, email, password, role: 'admin', phone
    });

    // clear OTP
    adminOTPs.delete(req.user._id.toString());

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
const getAllInquiries = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'provider') {
      const user = await User.findById(req.user._id);
      if (user && user.serviceId) {
        query.service = user.serviceId;
      } else {
        return res.json([]);
      }
    } else if (req.user && req.user.role === 'user') {
      query.user = req.user._id;
    }

    const inquiries = await Contact.find(query)
      .populate('user', 'name email country language state phone gender')
      .populate('service', 'name type city state images email phone priceStartsFrom instagram')
      .sort('-createdAt');

    // Map to include unread count and last message
    const Message = require('../models/Message');
    const enhancedInquiries = await Promise.all(inquiries.map(async (inq) => {
      const lastMessage = await Message.findOne({ booking: inq._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({
        booking: inq._id,
        receiver: req.user._id,
        read: false
      });

      // Fetch user's event history (excluding the current inquiry/booking)
      let userHistory = [];
      if (inq.user || inq.email) {
        const historyQuery = {
          _id: { $ne: inq._id },
          $or: []
        };
        if (inq.user) historyQuery.$or.push({ user: inq.user._id || inq.user });
        if (inq.email) historyQuery.$or.push({ email: inq.email });

        if (historyQuery.$or.length > 0) {
          userHistory = await Contact.find(historyQuery)
            .populate('service', 'name type city state')
            .sort('-createdAt')
            .lean();
        }
      }

      return {
        ...inq._doc,
        lastMessage,
        unreadCount,
        userHistory
      };
    }));

    res.json(enhancedInquiries);
  } catch (error) {
    console.error('Inquiry Fetch Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/admin/inquiries/:id
const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Contact.findById(req.params.id);
    if (inquiry) {
      const oldStatus = inquiry.status;
      const oldBudget = inquiry.budget;
      inquiry.status = req.body.status || inquiry.status;
      inquiry.eventType = req.body.eventType || inquiry.eventType;
      inquiry.message = req.body.message || inquiry.message;
      inquiry.budget = req.body.budget || inquiry.budget;
      if (req.body.eventDate !== undefined) inquiry.eventDate = req.body.eventDate;
      if (req.body.finalPrice !== undefined) inquiry.finalPrice = req.body.finalPrice;
      if (req.body.adminNotes !== undefined) inquiry.adminNotes = req.body.adminNotes;
      if (req.body.rejectionReason !== undefined) inquiry.rejectionReason = req.body.rejectionReason;
      if (req.body.billing !== undefined) inquiry.billing = req.body.billing;

      const updatedInquiry = await inquiry.save();

      // Return response immediately to client for instant UI response
      res.json(updatedInquiry);

      // Perform all heavy notification, PDF generation, email and WhatsApp side-effects in the background
      (async () => {
        try {
          // Notify user if budget changed
          if (oldBudget !== inquiry.budget && inquiry.user) {
            const Notification = require('../models/Notification');
            await Notification.create({
              recipient: inquiry.user,
              type: 'status_update',
              title: 'Budget Updated',
              message: `The budget for your ${inquiry.eventType} booking has been updated to ${inquiry.budget}.`
            });
          }

          // Send notifications if status changed
          if (oldStatus !== inquiry.status) {
            const sendEmail = require('../services/emailService');
            const sendWhatsAppMessage = require('../services/whatsappService');

            const statusColor = inquiry.status === 'accepted' ? '#28a745' :
              inquiry.status === 'rejected' ? '#dc3545' :
                inquiry.status === 'completed' ? '#4FC3F7' : '#C9A84C';

            const isCompleted = inquiry.status === 'completed';
            const isRejected = inquiry.status === 'rejected';

            if (isCompleted) {
              const { generatePDFBuffer } = require('../services/pdfService');
              const fs = require('fs');
              const path = require('path');

              // Find provider user if there is a service
              let providerUser = null;
              if (inquiry.service) {
                providerUser = await User.findOne({ serviceId: inquiry.service, role: 'provider' });
              }

              const actualProvider = providerUser || {
                name: 'THE VIBE CO. Admin',
                email: 'admin@thevibeco.com',
                phone: '8523086151'
              };

              // Generate premium receipt/dossier PDFs
              const userPdfBuffer = await generatePDFBuffer(inquiry, actualProvider, true);
              const providerPdfBuffer = await generatePDFBuffer(inquiry, actualProvider, false);

              // Ensure uploads directory exists
              const uploadsDir = path.join(__dirname, '../uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              // Save PDF receipt files to the static uploads folder
              const userFileName = `Receipt_${inquiry._id}_User.pdf`;
              const userFilePath = path.join(uploadsDir, userFileName);
              fs.writeFileSync(userFilePath, userPdfBuffer);
              const userPdfUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/uploads/${userFileName}`;

              const providerFileName = `Receipt_${inquiry._id}_Provider.pdf`;
              const providerFilePath = path.join(uploadsDir, providerFileName);
              fs.writeFileSync(providerFilePath, providerPdfBuffer);
              const providerPdfUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/uploads/${providerFileName}`;

              const totalAmount = (inquiry.billing && inquiry.billing.totalAmount)
                ? inquiry.billing.totalAmount
                : (inquiry.finalPrice || parseFloat(inquiry.budget.replace(/[^0-9.]/g, '')) || 0);

              // 1. Send Ultra-Premium Completion Email to User with PDF attachment
              await sendEmail({
                email: inquiry.email,
                subject: `⚜️ Event Completed Successfully - Receipt & Invoice - THE VIBE CO.`,
                message: `Dear ${inquiry.name}, your event has been completed. Please find your invoice receipt attached.`,
                html: `
                  <div style="background-color: #050505; color: #d4d4e6; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; padding: 40px 20px; text-align: center; border: 1px solid #C9A84C; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 32px; font-weight: bold; color: #C9A84C; letter-spacing: 6px;">THE VIBE CO.</span>
                      <div style="font-size: 8px; font-family: 'Outfit', 'Helvetica', sans-serif; color: #7a7a99; letter-spacing: 3px; margin-top: 5px; text-transform: uppercase;">The Pinnacle of Luxury Event Orchestration</div>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(201, 168, 76, 0.2); border-bottom: 1px solid rgba(201, 168, 76, 0.2); padding: 30px 0; margin: 30px 0;">
                      <h1 style="color: #C9A84C; font-size: 24px; font-weight: normal; letter-spacing: 2px; margin: 0 0 15px 0; text-transform: uppercase;">Event Completed Successfully</h1>
                      <p style="font-size: 16px; line-height: 1.6; color: #ffffff; font-family: 'Outfit', sans-serif; margin: 0 0 20px 0;">Dear <strong>${inquiry.name}</strong>,</p>
                      <p style="font-size: 14px; line-height: 1.8; color: #a3a3c2; font-family: 'Outfit', sans-serif; margin: 0; text-align: justify;">
                        We are delighted to confirm that your premium <strong>${inquiry.eventType.toUpperCase()}</strong> orchestration is successfully concluded. It has been an absolute privilege for <strong>THE VIBE CO.</strong> to bring your vision to life.
                      </p>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 8px; border: 1px solid rgba(201, 168, 76, 0.15); margin-bottom: 20px; text-align: left; font-family: 'Outfit', sans-serif;">
                      <h3 style="color: #C9A84C; font-family: 'Playfair Display', serif; font-size: 16px; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding-bottom: 5px;">Settlement Summary</h3>
                      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4e6;">
                        <tr>
                          <td style="padding: 6px 0; color: #7a7a99;">Event Orchestrated</td>
                          <td style="padding: 6px 0; text-align: right; color: #ffffff; font-weight: bold;">${inquiry.eventType.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #7a7a99;">Execution Date</td>
                          <td style="padding: 6px 0; text-align: right; color: #ffffff;">${inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</td>
                        </tr>
                        <tr style="border-top: 1px solid rgba(201, 168, 76, 0.1); margin-top: 10px;">
                          <td style="padding: 12px 0 6px 0; color: #C9A84C; font-weight: bold; font-size: 15px;">TOTAL COST</td>
                          <td style="padding: 12px 0 6px 0; text-align: right; color: #C9A84C; font-weight: bold; font-size: 16px;">Rs. ${totalAmount.toLocaleString()}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 8px; border: 1px solid rgba(201, 168, 76, 0.15); margin-bottom: 30px; text-align: left; font-family: 'Outfit', sans-serif;">
                      <h3 style="color: #C9A84C; font-family: 'Playfair Display', serif; font-size: 16px; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding-bottom: 5px;">Service Member Details</h3>
                      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4e6;">
                        <tr>
                          <td style="padding: 6px 0; color: #7a7a99;">Partner Name</td>
                          <td style="padding: 6px 0; text-align: right; color: #ffffff; font-weight: bold;">${actualProvider.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #7a7a99;">Contact Email</td>
                          <td style="padding: 6px 0; text-align: right; color: #ffffff;">${actualProvider.email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #7a7a99;">Contact Phone</td>
                          <td style="padding: 6px 0; text-align: right; color: #ffffff;">${actualProvider.phone || 'N/A'}</td>
                        </tr>
                      </table>
                    </div>
 
                    <div style="margin: 30px 0;">
                      <p style="font-family: 'Outfit', sans-serif; font-size: 14px; color: #a3a3c2; margin-bottom: 20px;">
                        Attached to this email, you will find your official luxury **Invoice Receipt Dossier** in PDF format containing complete itemized charges and partner details.
                      </p>
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/history" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; font-family: 'Outfit', sans-serif; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 2px; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 4px 15px rgba(201, 168, 76, 0.3);">
                        Review Your Experience
                      </a>
                    </div>
 
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                      <p style="font-size: 11px; font-family: 'Playfair Display', serif; font-style: italic; color: #C9A84C; letter-spacing: 2px; margin: 0 0 5px 0;">Experience the Extraordinary</p>
                      <p style="font-size: 9px; font-family: 'Outfit', sans-serif; color: #555577; margin: 0; text-transform: uppercase;">THE VIBE CO. Selection Committee & Execu-Team</p>
                    </div>
                  </div>
                `,
                attachments: [
                  {
                    filename: `Invoice_Receipt_${inquiry.name.replace(/\s+/g, '_')}.pdf`,
                    content: userPdfBuffer
                  }
                ]
              });

              // 2. Send Ultra-Premium Completion Email to Provider with PDF attachment
              if (providerUser) {
                await sendEmail({
                  email: providerUser.email,
                  subject: `⚜️ Booking Concluded - Client Work Dossier - THE VIBE CO.`,
                  message: `Dear ${providerUser.name}, your event booking has been completed. Client dossier details are attached.`,
                  html: `
                    <div style="background-color: #050505; color: #d4d4e6; font-family: 'Playfair Display', 'Didot', 'Georgia', serif; padding: 40px 20px; text-align: center; border: 1px solid #C9A84C; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                      <div style="margin-bottom: 20px;">
                        <span style="font-size: 32px; font-weight: bold; color: #C9A84C; letter-spacing: 6px;">THE VIBE CO.</span>
                        <div style="font-size: 8px; font-family: 'Outfit', 'Helvetica', sans-serif; color: #7a7a99; letter-spacing: 3px; margin-top: 5px; text-transform: uppercase;">The Pinnacle of Luxury Event Orchestration</div>
                      </div>
                      
                      <div style="border-top: 1px solid rgba(201, 168, 76, 0.2); border-bottom: 1px solid rgba(201, 168, 76, 0.2); padding: 30px 0; margin: 30px 0;">
                        <h1 style="color: #C9A84C; font-size: 24px; font-weight: normal; letter-spacing: 2px; margin: 0 0 15px 0; text-transform: uppercase;">Client Dossier Concluded</h1>
                        <p style="font-size: 16px; line-height: 1.6; color: #ffffff; font-family: 'Outfit', sans-serif; margin: 0 0 20px 0;">Dear <strong>${providerUser.name}</strong>,</p>
                        <p style="font-size: 14px; line-height: 1.8; color: #a3a3c2; font-family: 'Outfit', sans-serif; margin: 0; text-align: justify;">
                          Congratulations on successfully concluding the premium event booking for <strong>${inquiry.name}</strong>. Thank you for maintaining the elite service standards of <strong>THE VIBE CO.</strong> partner network.
                        </p>
                      </div>

                      <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 8px; border: 1px solid rgba(201, 168, 76, 0.15); margin-bottom: 30px; text-align: left; font-family: 'Outfit', sans-serif;">
                        <h3 style="color: #C9A84C; font-family: 'Playfair Display', serif; font-size: 16px; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding-bottom: 5px;">Client & Settlement Details</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4e6;">
                          <tr>
                            <td style="padding: 6px 0; color: #7a7a99;">Client Name</td>
                            <td style="padding: 6px 0; text-align: right; color: #ffffff; font-weight: bold;">${inquiry.name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #7a7a99;">Client Phone</td>
                            <td style="padding: 6px 0; text-align: right; color: #ffffff;">${inquiry.phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #7a7a99;">Client Email</td>
                            <td style="padding: 6px 0; text-align: right; color: #ffffff;">${inquiry.email}</td>
                          </tr>
                          <tr style="border-top: 1px solid rgba(201, 168, 76, 0.1); margin-top: 10px;">
                            <td style="padding: 12px 0 6px 0; color: #C9A84C; font-weight: bold; font-size: 15px;">TOTAL SETTLED OUTLAY</td>
                            <td style="padding: 12px 0 6px 0; text-align: right; color: #C9A84C; font-weight: bold; font-size: 16px;">Rs. ${totalAmount.toLocaleString()}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="margin: 30px 0;">
                        <p style="font-family: 'Outfit', sans-serif; font-size: 14px; color: #a3a3c2; margin-bottom: 20px;">
                          Attached is your official **Client Work Dossier** in PDF format containing itemized services and client information.
                        </p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(90deg, #C9A84C, #E6C667); color: #050505; font-family: 'Outfit', sans-serif; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 2px; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 4px 15px rgba(201, 168, 76, 0.3);">
                          Go to Partner Dashboard
                        </a>
                      </div>

                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-size: 11px; font-family: 'Playfair Display', serif; font-style: italic; color: #C9A84C; letter-spacing: 2px; margin: 0 0 5px 0;">Partnering for Excellence</p>
                        <p style="font-size: 9px; font-family: 'Outfit', sans-serif; color: #555577; margin: 0; text-transform: uppercase;">THE VIBE CO. Selection Committee & Execu-Team</p>
                      </div>
                    </div>
                  `,
                  attachments: [
                    {
                      filename: `Client_Dossier_${inquiry.name.replace(/\s+/g, '_')}.pdf`,
                      content: providerPdfBuffer
                    }
                  ]
                });
              }

              // 3. Send User completion WhatsApp with dynamic PDF Receipt Link
              if (inquiry.phone) {
                const userWaMsg = `*THE VIBE CO.* ⚜️\n\n*Event Completed Successfully!* 🥂\n\nHello ${inquiry.name}, your event has been completed. We hope you had an extraordinary experience!\n\n💰 *Total Cost:* Rs. ${totalAmount.toLocaleString()}\n👤 *Service Member:* ${actualProvider.name}\n\nDownload your luxury *Invoice Receipt PDF* directly here:\n${userPdfUrl}\n\nWe'd love to hear your feedback! Please visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/history to leave a review.`;
                await sendWhatsAppMessage(inquiry.phone, userWaMsg);
              }

              // 4. Send Provider completion WhatsApp with dynamic PDF Work Dossier Link
              if (actualProvider.phone && actualProvider.role === 'provider') {
                const providerWaMsg = `*THE VIBE CO. PARTNER* ⚜️\n\n*Client Dossier Concluded!* ✅\n\nHello ${actualProvider.name}, the event booking for ${inquiry.name} has been marked as COMPLETED.\n\n💰 *Total Settled Outlay:* Rs. ${totalAmount.toLocaleString()}\n👤 *Client:* ${inquiry.name}\n\nDownload your *Client Work Dossier PDF* directly here:\n${providerPdfUrl}\n\nThank you for maintaining our elite service standards! - THE VIBE CO.`;
                await sendWhatsAppMessage(actualProvider.phone, providerWaMsg);
              }
            } else {
              // Send Standard status update emails and WhatsApps
              // Send Status Update Email
              await sendEmail({
                email: inquiry.email,
                subject: `Update on your Inquiry: ${inquiry.eventType.toUpperCase()} - THE VIBE CO.`,
                message: `Hello ${inquiry.name}, the status of your inquiry for ${inquiry.eventType} has been updated to ${inquiry.status}.`,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #C9A84C; border-radius: 10px;">
                    <h2 style="color: #C9A84C;">${isRejected ? 'Update Regarding Your Inquiry' : 'Inquiry Status Update'}</h2>
                    <p>Hello <strong>${inquiry.name}</strong>,</p>
                    <p>The status of your inquiry for <strong>${inquiry.eventType}</strong> has been updated by our team.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid ${statusColor};">
                      <p style="margin: 0; font-size: 1.1rem;">Status: <strong style="color: ${statusColor}; text-transform: uppercase;">${inquiry.status}</strong></p>
                      ${isRejected && inquiry.rejectionReason ? `<p style="margin: 10px 0 0 0; color: #555;"><strong>Reason:</strong> ${inquiry.rejectionReason}</p>` : ''}
                    </div>
                    ${isRejected ? '<p>We appreciate your interest in THE VIBE CO. and hope to serve you at another time.</p>' : '<p>If you have any questions, feel free to contact us.</p>'}
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                      <p style="font-size: 0.8rem; color: #777;">Best Regards,<br/>The Vibe Co. Team</p>
                    </div>
                  </div>
                `
              });

              // Send Status Update WhatsApp/SMS
              if (inquiry.phone) {
                let waMsg = `Hello ${inquiry.name}, your inquiry for ${inquiry.eventType} has been updated to ${inquiry.status.toUpperCase()}. Check your email for more details. - THE VIBE CO.`;
                if (isRejected && inquiry.rejectionReason) {
                  waMsg = `Hello ${inquiry.name}, your inquiry for ${inquiry.eventType} was unfortunately declined. Reason: ${inquiry.rejectionReason}. Check your email for more details. - THE VIBE CO.`;
                }
                await sendWhatsAppMessage(inquiry.phone, waMsg);
              }
            }

            // Create internal notification for user
            const Notification = require('../models/Notification');
            if (inquiry.user) {
              await Notification.create({
                recipient: inquiry.user,
                type: 'status_update',
                title: 'Inquiry Status Update',
                message: `The status of your inquiry for ${inquiry.eventType} has been updated to ${inquiry.status.toUpperCase()}.`
              });
            }

            // Notify Admin about status change
            const admins = await User.find({ role: 'admin' });
            for (const adminUser of admins) {
              await Notification.create({
                recipient: adminUser._id,
                type: 'status_update',
                title: 'Booking Status Changed',
                message: `Inquiry for ${inquiry.eventType} from ${inquiry.name} was ${inquiry.status.toUpperCase()} by the service provider.`
              });
            }

            // Send admin email about status change
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@thevibeco.com';
            await sendEmail({
              email: adminEmail,
              subject: `Booking ${inquiry.status.toUpperCase()}: ${inquiry.eventType} - ${inquiry.name}`,
              message: `Inquiry from ${inquiry.name} for ${inquiry.eventType} has been ${inquiry.status} by the service provider.`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #C9A84C; border-radius: 10px;">
                  <h2 style="color: #C9A84C;">Booking Status Update</h2>
                  <p>A service provider has updated a booking status:</p>
                  <p><strong>Client:</strong> ${inquiry.name}</p>
                  <p><strong>Event:</strong> ${inquiry.eventType}</p>
                  <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${inquiry.status}</span></p>
                  ${inquiry.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${inquiry.rejectionReason}</p>` : ''}
                  <p style="font-size: 0.8rem; color: #777; margin-top: 20px;">THE VIBE CO. Admin Notification</p>
                </div>
              `
            });

            // Send admin WhatsApp
            const adminPhone = process.env.ADMIN_PHONE || '';
            if (adminPhone) {
              await sendWhatsAppMessage(
                adminPhone,
                `📋 Booking Update: ${inquiry.name}'s ${inquiry.eventType} inquiry has been ${inquiry.status.toUpperCase()} by the provider.${inquiry.rejectionReason ? ' Reason: ' + inquiry.rejectionReason : ''} - THE VIBE CO.`
              );
            }

            // Notify the Provider who made the action
            if (inquiry.service) {
              const providerUser = await User.findOne({ serviceId: inquiry.service, role: 'provider' });
              if (providerUser) {
                await Notification.create({
                  recipient: providerUser._id,
                  type: 'status_update',
                  title: `You ${inquiry.status} a booking`,
                  message: `You have ${inquiry.status} the ${inquiry.eventType} booking from ${inquiry.name}.`
                });

                // WhatsApp confirmation to provider
                if (providerUser.phone) {
                  await sendWhatsAppMessage(
                    providerUser.phone,
                    `✅ Confirmation: You have ${inquiry.status.toUpperCase()} the ${inquiry.eventType} booking from ${inquiry.name}. - THE VIBE CO.`
                  );
                }
              }
            }
          }
        } catch (bgError) {
          console.error('❌ Background Notification Error in updateInquiryStatus:', bgError);
        }
      })();
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('service', 'name type')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review status
// @route   PUT /api/admin/reviews/:id
const updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'phone email name');
    if (review) {
      const oldStatus = review.status;
      review.status = req.body.status || review.status;
      const updatedReview = await review.save();

      // Send notifications if status changed
      if (oldStatus !== review.status) {
        try {
          const sendEmail = require('../services/emailService');
          const sendWhatsAppMessage = require('../services/whatsappService');

          const statusColor = review.status === 'approved' ? '#28a745' :
            review.status === 'rejected' ? '#dc3545' : '#C9A84C';

          // Send Status Update Email
          await sendEmail({
            email: review.email,
            subject: `Update on your Review - THE VIBE CO.`,
            message: `Hello ${review.name}, the status of your review has been updated to ${review.status}.`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #C9A84C; border-radius: 10px;">
                <h2 style="color: #C9A84C;">Review Status Update</h2>
                <p>Hello <strong>${review.name}</strong>,</p>
                <p>The status of your review has been updated by our team.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid ${statusColor};">
                  <p style="margin: 0; font-size: 1.1rem;">New Status: <strong style="color: ${statusColor}; text-transform: uppercase;">${review.status}</strong></p>
                </div>
                <p>Thank you for sharing your feedback with us!</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-size: 0.8rem; color: #777;">Best Regards,<br/>The Vibe Co. Team</p>
                </div>
              </div>
            `
          });

          // Send Status Update WhatsApp/SMS if phone available
          const phone = review.user?.phone || '';
          if (phone) {
            await sendWhatsAppMessage(
              phone,
              `Hello ${review.name}, your review status has been updated to ${review.status.toUpperCase()}. Thank you for your feedback! - THE VIBE CO.`
            );
          }

          // Create internal notification
          const Notification = require('../models/Notification');
          if (review.user) {
            await Notification.create({
              recipient: review.user._id,
              type: 'review',
              title: 'Review Status Update',
              message: `The status of your review has been updated to ${review.status.toUpperCase()}.`
            });
          }
        } catch (notifError) {
          console.error('Notification Error after review update:', notifError);
        }
      }

      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      await review.deleteOne();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  createUser,
  deleteUser,
  createAdminInit,
  createAdminVerify,
  getAllInquiries,
  updateInquiryStatus,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};
