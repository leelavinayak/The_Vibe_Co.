const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Service = require('../models/Service');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, state, gender, language, country } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone, state, gender, language, country });

    // Send notifications
    try {
      const sendEmail = require('../services/emailService');
      const sendWhatsAppMessage = require('../services/whatsappService');
      const { welcomeTemplate } = require('../utils/premiumTemplates');

      // Send Welcome Email
      await sendEmail({
        email: user.email,
        subject: 'Welcome to THE VIBE CO. ⚜️',
        message: `Hello ${user.name}, thank you for registering with THE VIBE CO.`,
        html: welcomeTemplate(user.name)
      });

      // Send Welcome WhatsApp/SMS
      if (user.phone) {
        await sendWhatsAppMessage(
          user.phone,
          `Hello ${user.name}, welcome to THE VIBE CO.! Your account has been successfully created. Explore our premium event services now.`
        );
      }

      // Create internal notification
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: user._id,
        type: 'welcome',
        title: 'Welcome to THE VIBE CO.',
        message: 'Your account has been successfully created. Explore our premium event services now!'
      });
    } catch (notifError) {
      console.error('Notification Error after registration:', notifError);
      // We don't fail the registration if notifications fail
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      state: user.state,
      gender: user.gender,
      language: user.language,
      country: user.country,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Server Error during registration' });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if doesn't exist
      // Generate random password for OAuth users
      const password = Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        password,
        avatar: picture
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      state: user.state,
      gender: user.gender,
      language: user.language,
      country: user.country,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    console.log(`Login attempt for: ${email}`);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ User ${email} logged in successfully! Role: ${user.role}`);

    // Create login notification
    try {
      const Notification = require('../models/Notification');
      const userAgent = req.headers['user-agent'] || 'Unknown device';
      const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Laptop/Desktop';
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

      await Notification.create({
        recipient: user._id,
        type: 'login',
        title: `Welcome back, ${user.name}!`,
        message: `You signed in on ${deviceType} at ${timeStr} on ${dateStr}. If this wasn't you, please change your password immediately.`,
        link: '/profile'
      });
    } catch (notifError) {
      console.error('Login notification error:', notifError.message);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      state: user.state,
      gender: user.gender,
      language: user.language,
      country: user.country,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(`❌ Login Error for ${req.body?.email}:`, error.message);
    res.status(500).json({ message: 'Internal Server Error during login.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('serviceId');

    // Also get inquiry count and history
    const Contact = require('../models/Contact');
    const inquiries = await Contact.find({ user: user._id })
      .populate('service', 'name type images city')
      .sort('-createdAt');

    res.json({
      user,
      inquiryCount: inquiries.length,
      inquiryHistory: inquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.state = req.body.state !== undefined ? req.body.state : user.state;
      user.city = req.body.city !== undefined ? req.body.city : user.city;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      user.language = req.body.language !== undefined ? req.body.language : user.language;
      user.country = req.body.country !== undefined ? req.body.country : user.country;

      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // If user is a provider, also update their service details or create if missing
      if (user.role === 'provider') {
        const serviceUpdate = {
          name: req.body.serviceName || (user.serviceId ? undefined : user.name),
          type: req.body.serviceType || (user.serviceId ? undefined : 'total_event_organisation'),
          description: req.body.description || (user.serviceId ? undefined : 'Premium event service provider'),
          priceStartsFrom: req.body.priceStartsFrom || (user.serviceId ? undefined : 'Contact for pricing'),
          instagram: req.body.instagram !== undefined ? req.body.instagram : undefined,
          images: req.body.images !== undefined ? req.body.images : undefined
        };

        // Remove undefined fields
        Object.keys(serviceUpdate).forEach(key => serviceUpdate[key] === undefined && delete serviceUpdate[key]);

        if (user.serviceId) {
          await Service.findByIdAndUpdate(user.serviceId, serviceUpdate);
        } else if (Object.keys(serviceUpdate).length >= 4) { 
          // Only create if we have the minimum required fields
          const newService = await Service.create({
            name: serviceUpdate.name,
            type: serviceUpdate.type,
            description: serviceUpdate.description,
            priceStartsFrom: serviceUpdate.priceStartsFrom,
            ...serviceUpdate
          });
          user.serviceId = newService._id;
          await user.save();
        }
      }
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        state: updatedUser.state,
        city: updatedUser.city,
        gender: updatedUser.gender,
        language: updatedUser.language,
        country: updatedUser.country,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const sendEmail = require('../services/emailService');
    const sendWhatsAppMessage = require('../services/whatsappService');

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - THE VIBE CO.',
      message: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #C9A84C;">THE VIBE CO.</h2>
          <p>You requested a password reset. Use the OTP below to change your password:</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    // Send OTP via WhatsApp/SMS too
    if (user.phone) {
      try {
        await sendWhatsAppMessage(
          user.phone,
          `THE VIBE CO.: Your password reset OTP is ${otp}. It expires in 10 minutes. If you didn't request this, please ignore.`
        );
      } catch (whatsappErr) {
        console.error('WhatsApp forgot password OTP error:', whatsappErr);
      }
    }

    res.json({ message: 'OTP sent to email and phone' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/resetpassword
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for password change (logged-in user)
// @route   POST /api/auth/change-password-otp
const sendChangePasswordOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const sendEmail = require('../services/emailService');
    const { otpTemplate } = require('../utils/premiumTemplates');

    await sendEmail({
      email: user.email,
      subject: 'Verification Protocol - THE VIBE CO. ⚜️',
      message: `Your OTP for password change is: ${otp}`,
      html: otpTemplate(otp)
    });

    if (user.phone) {
      try {
        const sendWhatsAppMessage = require('../services/whatsappService');
        await sendWhatsAppMessage(
          user.phone,
          `THE VIBE CO.: Your password change OTP is ${otp}. It expires in 10 minutes.`
        );
      } catch (whatsappErr) {
        console.error('WhatsApp OTP error:', whatsappErr);
      }
    }

    res.json({ message: 'OTP sent to your registered email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password with OTP verification (logged-in user)
// @route   POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({
      _id: req.user._id,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  sendChangePasswordOTP,
  changePassword
};
