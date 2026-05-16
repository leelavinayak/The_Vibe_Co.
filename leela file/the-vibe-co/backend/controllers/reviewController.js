const Review = require('../models/Review');
const Service = require('../models/Service');
const sendEmail = require('../services/emailService');
const sendWhatsAppMessage = require('../services/whatsappService');

// @desc    Create a review
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { name, email, rating, comment, service } = req.body;
    
    const reviewData = {
      name,
      email,
      rating,
      comment,
      service
    };

    if (req.user) {
      reviewData.user = req.user._id;
    }
    
    const review = await Review.create(reviewData);

    // Update Service average rating
    if (service) {
      const allReviews = await Review.find({ service, status: 'approved' });
      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
        await Service.findByIdAndUpdate(service, {
          rating: Number(avgRating.toFixed(1)),
          numReviews: allReviews.length
        });
      }
    }

    // Send Email to Admin about new review
    const adminEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #d4d4e6; padding: 40px; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(201,168,76,0.2); padding-bottom: 20px;">
          <h1 style="color: #C9A84C; font-family: Georgia, serif; letter-spacing: 3px; margin: 0; font-size: 28px;">THE VIBE CO.</h1>
        </div>
        <h3 style="color: #ffffff; font-weight: 300; font-size: 20px; border-left: 3px solid #C9A84C; padding-left: 15px;">New Review Submitted</h3>
        <p style="margin-bottom: 10px;"><strong style="color:#C9A84C;">Name:</strong> ${name}</p>
        <p style="margin-bottom: 10px;"><strong style="color:#C9A84C;">Email:</strong> ${email}</p>
        <p style="margin-bottom: 20px;"><strong style="color:#C9A84C;">Rating:</strong> <span style="font-size: 18px; color: #FFD700;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span></p>
        <div style="margin-top: 20px; padding: 20px; background: #111; border-radius: 8px;">
          <strong style="color:#C9A84C; display: block; margin-bottom: 10px;">Client's Comment:</strong>
          <p style="line-height: 1.6; margin: 0; font-style: italic;">"${comment}"</p>
        </div>
      </div>
    `;
    await sendEmail({
      email: process.env.ADMIN_EMAIL || 'admin@thevibeco.com',
      subject: `New ${rating}-Star Review from ${name}`,
      html: adminEmailHtml,
      message: `New review from ${name} (${rating} stars)`
    });

    // Send Thank You Email to User
    const userEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #d4d4e6; padding: 40px; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); text-align: center;">
        <h1 style="color: #C9A84C; font-family: Georgia, serif; letter-spacing: 3px; margin: 0 0 20px 0; font-size: 28px;">THE VIBE CO.</h1>
        <div style="width: 50px; height: 2px; background: #C9A84C; margin: 0 auto 30px;"></div>
        
        <h3 style="color: #ffffff; font-weight: 300; font-size: 22px;">Thank You, ${name}!</h3>
        <p style="line-height: 1.8; color: #9999b3; margin-bottom: 25px;">
          We deeply appreciate you taking the time to share your experience with <strong>THE VIBE CO.</strong>
        </p>
        <p style="line-height: 1.8; color: #9999b3; margin-bottom: 40px;">
          Your feedback is incredibly valuable to us. It helps us continue to refine our services and deliver exceptional, premium events for our clients.
        </p>
        
        <div style="border-top: 1px solid rgba(201,168,76,0.2); padding-top: 30px; margin-top: 20px;">
          <p style="color: #7a7a99; font-size: 14px; margin: 0;">Warm regards,</p>
          <p style="color: #C9A84C; font-family: Georgia, serif; font-size: 18px; letter-spacing: 1px; margin: 10px 0 0;">The Vibe Co. Team</p>
        </div>
      </div>
    `;
    await sendEmail({
      email: email,
      subject: 'Thank you for your review!',
      html: userEmailHtml,
      message: `Thank you for your review, ${name}!`
    });

    // Send WhatsApp notifications
    try {
      // Notify admin about new review
      const adminPhone = process.env.ADMIN_PHONE || '';
      if (adminPhone) {
        await sendWhatsAppMessage(
          adminPhone,
          `⭐ New ${rating}-Star Review from ${name}!\n\n"${comment}"\n\nCheck your admin dashboard to approve. - THE VIBE CO.`
        );
      }

      // Send thank-you WhatsApp to user if they have a phone
      if (req.user) {
        const User = require('../models/User');
        const userData = await User.findById(req.user._id);
        if (userData?.phone) {
          await sendWhatsAppMessage(
            userData.phone,
            `Thank you for your ${rating}-star review, ${name}! 🌟 Your feedback helps us maintain our elite standards. - THE VIBE CO.`
          );
        }
      }
    } catch (whatsappErr) {
      console.error('WhatsApp review notification error:', whatsappErr);
    }

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent reviews and stats
// @route   GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { serviceId } = req.query;
    const filter = { status: 'approved' };
    if (serviceId) {
      filter.service = serviceId;
    }

    // Get reviews based on filter
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(serviceId ? 50 : 10);

    // Calculate stats
    const stats = await Review.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;
    const averageRating = stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0;
    const percentage = totalReviews > 0 ? Math.round((averageRating / 5) * 100) : 0;

    res.json(serviceId ? reviews : {
      reviews,
      stats: {
        total: totalReviews,
        average: averageRating,
        percentage: percentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews };
