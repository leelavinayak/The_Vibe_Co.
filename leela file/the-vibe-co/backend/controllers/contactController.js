const Contact = require('../models/Contact');
const Service = require('../models/Service');
const sendEmail = require('../services/emailService');
const sendWhatsAppMessage = require('../services/whatsappService');
const PDFDocument = require('pdfkit');

// Helper to generate a beautiful PDF in memory
const generatePDFBuffer = (contact) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Inquiry - ${contact.name}`,
        Author: 'THE VIBE CO.'
      }
    });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Premium Design Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#050505');

    // Ornamental Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(1).strokeColor('#C9A84C').stroke();
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(0.5).strokeColor('#C9A84C').stroke();

    // Header
    doc.fillColor('#C9A84C')
      .font('Times-Bold')
      .fontSize(40)
      .text('THE VIBE CO.', { align: 'center', charSpacing: 10 });

    doc.moveDown(0.2);
    doc.fillColor('#7a7a99')
      .font('Helvetica')
      .fontSize(9)
      .text('THE PINNACLE OF EVENT ORCHESTRATION', { align: 'center', characterSpacing: 4 });

    doc.moveDown(4);

    // Section Title
    doc.fillColor('#ffffff').fontSize(22).font('Times-Bold').text('INQUIRY DOSSIER', { align: 'center', characterSpacing: 2 });
    doc.moveDown(0.5);
    doc.moveTo(200, doc.y).lineTo(doc.page.width - 200, doc.y).lineWidth(1).strokeColor('#C9A84C').stroke();
    doc.moveDown(3);

    const addRow = (label, value) => {
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(11).text(label.toUpperCase(), { continued: false });
      doc.moveDown(0.2);
      doc.fillColor('#ffffff').font('Helvetica').fontSize(14).text(value || 'NOT SPECIFIED');
      doc.moveDown(1.5);
    };

    addRow('Client Name', contact.name);
    addRow('Email Address', contact.email);
    addRow('Phone Number', contact.phone);
    addRow('Orchestration Type', contact.eventType);
    addRow('Allocation (Budget)', contact.budget);
    addRow('Execution Date', contact.eventDate ? new Date(contact.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TO BE DETERMINED');
    
    doc.moveDown(1);
    doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(11).text('REQUIREMENT BRIEF', { underline: false });
    doc.moveDown(0.5);
    doc.fillColor('#7a7a99').font('Helvetica').fontSize(12).text(contact.message || 'No specific requirements provided.', { lineGap: 6, align: 'justify' });

    // Footer
    const bottomPos = doc.page.height - 100;
    doc.moveTo(50, bottomPos).lineTo(doc.page.width - 50, bottomPos).lineWidth(0.5).strokeColor('rgba(201,168,76,0.2)').stroke();
    doc.moveDown(2);
    doc.fillColor('#C9A84C').font('Times-Bold').fontSize(12).text('EXPERIENCE THE EXTRAORDINARY', { align: 'center', characterSpacing: 5 });
    doc.moveDown(0.5);
    doc.fillColor('#555577').fontSize(8).text('CONFIDENTIAL | FOR AUTHORIZED USE ONLY', { align: 'center' });

    doc.end();
  });
};

// @desc    Submit contact form
// @route   POST /api/contact
const submitContact = async (req, res) => {
  try {
    const contactData = { ...req.body };
    const User = require('../models/User');

    let userId = req.user?._id;
    if (!userId) {
      const existingUser = await User.findOne({ email: contactData.email });
      if (existingUser) {
        userId = existingUser._id;
      }
    }
    contactData.user = userId;

    const contact = await Contact.create(contactData);

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(contact);

    const { inquiryAdminTemplate, welcomeTemplate, whatsappTemplate } = require('../utils/premiumTemplates');

    // 1. Send Email to Admin
    await sendEmail({
      email: process.env.ADMIN_EMAIL || 'admin@thevibeco.com',
      subject: `New Event Inquiry: ${contact.eventType.toUpperCase()} ⚜️`,
      html: inquiryAdminTemplate(contact),
      message: `New inquiry from ${contact.name}`,
      attachments: [
        {
          filename: `Inquiry_${contact.name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    // 2. Send Thank You Email to User
    await sendEmail({
      email: contact.email,
      subject: 'Orchestration Request Received - THE VIBE CO. ⚜️',
      html: welcomeTemplate(contact.name),
      message: `Hi ${contact.name}, we have received your inquiry.`
    });

    // 3. Send WhatsApp/SMS to User
    if (contact.phone) {
      await sendWhatsAppMessage(contact.phone, whatsappTemplate(contact.name, contact.eventType));
    }

    // 4. Send WhatsApp/SMS to Admin
    try {
      const adminPhone = process.env.ADMIN_PHONE || '';
      if (adminPhone) {
        await sendWhatsAppMessage(
          adminPhone,
          `🔔 New ${contact.eventType.toUpperCase()} Inquiry!\n\nClient: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nBudget: ${contact.budget || 'N/A'}\nDate: ${contact.eventDate ? new Date(contact.eventDate).toLocaleDateString() : 'TBD'}\n\nCheck your admin dashboard for full details. - THE VIBE CO.`
        );
      }
    } catch (adminWhatsappErr) {
      console.error('Admin WhatsApp notification error:', adminWhatsappErr);
    }

    // 5. Send Email to Provider
    if (contactData.service) {
      try {
        const providerUser = await User.findOne({ serviceId: contactData.service, role: 'provider' });
        if (providerUser) {
          await sendEmail({
            email: providerUser.email,
            subject: `New Service Booking Request: ${contact.eventType.toUpperCase()} ⚜️`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #C9A84C; border-radius: 10px;">
                <h2 style="color: #C9A84C;">New Booking Inquiry Received</h2>
                <p>Hello <strong>${providerUser.name}</strong>,</p>
                <p>You have received a new booking request for your service on THE VIBE CO.</p>
                <p><strong>Client:</strong> ${contact.name}</p>
                <p><strong>Event Date:</strong> ${contact.eventDate ? new Date(contact.eventDate).toLocaleDateString() : 'TBD'}</p>
                <p>Please log in to your Provider Dashboard to review the details, chat with the client, and accept or reject the booking.</p>
                <a href="${process.env.FRONTEND_URL}/login" style="background: #C9A84C; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px;">Go to Dashboard</a>
              </div>
            `,
            message: `New booking request from ${contact.name}`
          });
        }
      } catch (providerEmailErr) {
        console.error('Provider Email notification error:', providerEmailErr);
      }
    }


    // 4. Create Internal Notifications
    try {
      const Notification = require('../models/Notification');

      // Notify User
      if (userId) {
        await Notification.create({
          recipient: userId,
          type: 'inquiry',
          title: 'Inquiry Submitted',
          message: `Your inquiry for a ${contact.eventType} event has been received. We'll get back to you soon!`
        });
      }

      // Notify Admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user ? req.user._id : null,
          type: 'inquiry',
          title: 'New Event Inquiry',
          message: `New ${contact.eventType} inquiry from ${contact.name}`,
          link: `/admin/inquiries` // Assuming this is the admin path
        });
      }

      // Notify Provider
      if (contactData.service) {
        const providerUser = await User.findOne({ serviceId: contactData.service, role: 'provider' });
        if (providerUser) {
          await Notification.create({
            recipient: providerUser._id,
            sender: req.user ? req.user._id : null,
            type: 'inquiry',
            title: 'New Booking Inquiry',
            message: `New ${contact.eventType} booking request from ${contact.name}. Open your dashboard to view details.`,
            link: `/provider-dashboard`
          });
        }
      }
    } catch (notifError) {
      console.error('Internal Notification Error:', notifError);
    }

    res.status(201).json({
      message: 'Thank you for reaching out! We\'ll get back to you soon.',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contacts (admin)
// @route   GET /api/contact
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate('user', 'name email phone state country')
      .populate('service', 'name type city state images email phone priceStartsFrom instagram')
      .sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public stats for the landing page
// @route   GET /api/contact/stats
const getPublicStats = async (req, res) => {
  try {
    const totalInquiries = await Contact.countDocuments();
    const activeProjects = await Contact.countDocuments({ status: 'in-progress' });
    const happyClients = await Contact.countDocuments({ status: 'completed' });
    
    // Fallback for demo if counts are 0
    res.json({
      totalInquiries: totalInquiries || 150,
      activeProjects: activeProjects || 12,
      happyClients: happyClients || 98
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyInquiries = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const inquiries = await Contact.find({ user: req.user._id })
      .populate('service', 'name type city state images email phone priceStartsFrom instagram providerId')
      .sort({ createdAt: -1 });

    // Map to include unread count and last message
    const enhancedInquiries = await Promise.all(inquiries.map(async (inq) => {
      const lastMessage = await Message.findOne({ booking: inq._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ 
        booking: inq._id, 
        receiver: req.user._id, 
        read: false 
      });
      return {
        ...inq._doc,
        lastMessage,
        unreadCount
      };
    }));

    res.json(enhancedInquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitContact, getContacts, getPublicStats, getMyInquiries };
