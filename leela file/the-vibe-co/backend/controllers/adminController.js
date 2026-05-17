const mongoose = require('mongoose');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const Service = require('../models/Service');

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

      const updatedUser = await user.save();
      res.json(updatedUser);
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

      // Notify user if budget changed
      if (oldBudget !== inquiry.budget && inquiry.user) {
        const Notification = require('../models/Notification');
        await Notification.create({
          recipient: inquiry.user,
          type: 'info',
          title: 'Budget Updated',
          message: `The budget for your ${inquiry.eventType} booking has been updated to ${inquiry.budget}.`
        });
      }

      // Send notifications if status changed
      if (oldStatus !== inquiry.status) {
        try {
          const sendEmail = require('../services/emailService');
          const sendWhatsAppMessage = require('../services/whatsappService');

          const statusColor = inquiry.status === 'accepted' ? '#28a745' : 
                             inquiry.status === 'rejected' ? '#dc3545' : 
                             inquiry.status === 'completed' ? '#4FC3F7' : '#C9A84C';

          const isCompleted = inquiry.status === 'completed';
          const isRejected = inquiry.status === 'rejected';

          // Send Status Update Email
          await sendEmail({
            email: inquiry.email,
            subject: `Update on your Inquiry: ${inquiry.eventType.toUpperCase()} - THE VIBE CO.`,
            message: `Hello ${inquiry.name}, the status of your inquiry for ${inquiry.eventType} has been updated to ${inquiry.status}.`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #C9A84C; border-radius: 10px;">
                <h2 style="color: #C9A84C;">${isCompleted ? 'Event Completed Successfully!' : (isRejected ? 'Update Regarding Your Inquiry' : 'Inquiry Status Update')}</h2>
                <p>Hello <strong>${inquiry.name}</strong>,</p>
                <p>${isCompleted ? 'Your event has been completed successfully! We hope you had an extraordinary experience with THE VIBE CO.' : `The status of your inquiry for <strong>${inquiry.eventType}</strong> has been updated by our team.`}</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid ${statusColor};">
                  <p style="margin: 0; font-size: 1.1rem;">Status: <strong style="color: ${statusColor}; text-transform: uppercase;">${inquiry.status}</strong></p>
                  ${isRejected && inquiry.rejectionReason ? `<p style="margin: 10px 0 0 0; color: #555;"><strong>Reason:</strong> ${inquiry.rejectionReason}</p>` : ''}
                </div>
                ${isCompleted ? `
                <div style="margin: 20px 0; padding: 15px; background: rgba(201,168,76,0.05); border-radius: 10px; border: 1px dashed #C9A84C;">
                  <p style="margin: 0 0 10px 0;"><strong>We value your feedback!</strong></p>
                  <p style="margin: 0; font-size: 0.9rem;">Could you please take a moment to share your review for both our <strong>website</strong> and the <strong>service member</strong>? Your feedback helps us maintain our elite standards.</p>
                  <p style="margin: 15px 0 0 0;"><a href="${process.env.FRONTEND_URL}/history" style="background: #C9A84C; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Give Your Review</a></p>
                </div>
                ` : (isRejected ? '<p>We appreciate your interest in THE VIBE CO. and hope to serve you at another time.</p>' : '<p>If you have any questions, feel free to contact us.</p>')}
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-size: 0.8rem; color: #777;">Best Regards,<br/>The Vibe Co. Team</p>
                </div>
              </div>
            `
          });

          // Send Status Update WhatsApp/SMS
          if (inquiry.phone) {
            let waMsg = isCompleted 
              ? `Hello ${inquiry.name}, your event has been COMPLETED successfully! 🥂 We'd love to hear your feedback on our website and the service member. Please visit your history to leave a review. - THE VIBE CO.`
              : `Hello ${inquiry.name}, your inquiry for ${inquiry.eventType} has been updated to ${inquiry.status.toUpperCase()}. Check your email for more details. - THE VIBE CO.`;
            
            if (isRejected && inquiry.rejectionReason) {
              waMsg = `Hello ${inquiry.name}, your inquiry for ${inquiry.eventType} was unfortunately declined. Reason: ${inquiry.rejectionReason}. Check your email for more details. - THE VIBE CO.`;
            }

            await sendWhatsAppMessage(inquiry.phone, waMsg);
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
        } catch (notifError) {
          console.error('Notification Error after inquiry update:', notifError);
        }
      }

      res.json(updatedInquiry);
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
  getAllInquiries,
  updateInquiryStatus,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};
