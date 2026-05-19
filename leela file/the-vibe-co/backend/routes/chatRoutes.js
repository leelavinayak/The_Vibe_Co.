const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get messages for a booking (and any bookings between same user & provider)
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const currentBooking = await Contact.findById(req.params.bookingId);
    if (!currentBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let query = { user: currentBooking.user };
    if (currentBooking.service) {
      query.service = currentBooking.service;
    } else {
      query.service = { $exists: false };
    }

    const allBookings = await Contact.find(query);
    const bookingIds = allBookings.map(b => b._id);

    const messages = await Message.find({ booking: { $in: bookingIds } })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .populate('receiver', 'name role');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message (Update for files)
router.post('/', protect, async (req, res) => {
  let { bookingId, receiverId, text, fileUrl, fileType } = req.body;
  try {
    const User = require('../models/User');
    
    if (!receiverId || receiverId === 'admin' || !require('mongoose').Types.ObjectId.isValid(receiverId)) {
      const booking = await Contact.findById(bookingId).populate('service');
      if (booking && booking.service) {
        const provider = await User.findOne({ serviceId: booking.service._id, role: 'provider' });
        receiverId = provider ? provider._id : (await User.findOne({ role: 'admin' }))?._id;
      } else {
        receiverId = (await User.findOne({ role: 'admin' }))?._id;
      }
    }

    const message = await Message.create({
      booking: bookingId,
      sender: req.user._id,
      receiver: receiverId,
      text,
      fileUrl,
      fileType
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role phone');

    // Send WhatsApp notification to receiver
    let receiverPhone = populatedMessage.receiver?.phone;
    if (!receiverPhone && populatedMessage.receiver?.role === 'admin') {
      receiverPhone = process.env.ADMIN_PHONE || '8523086151';
    }

    if (receiverPhone) {
      try {
        const senderName = populatedMessage.sender?.name || 'Someone';
        let whatsappMsg = `*THE VIBE CO.* ⚜️\n\n*New Chat Message from ${senderName}*\n`;
        if (text) {
          whatsappMsg += `\n💬 "${text}"`;
        }
        if (fileUrl) {
          whatsappMsg += `\n📎 Attachment: ${fileUrl}`;
        }
        whatsappMsg += `\n\nReply directly on the platform: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;

        const sendWhatsAppMessage = require('../services/whatsappService');
        await sendWhatsAppMessage(receiverPhone, whatsappMsg);

        // Forward a Copy to Admin's WhatsApp (if the message is between client & service provider)
        const adminPhone = process.env.ADMIN_PHONE || '8523086151';
        if (populatedMessage.receiver?.role !== 'admin' && populatedMessage.sender?.role !== 'admin') {
          let adminMsg = `*THE VIBE CO. [MONITOR]* ⚜️\n\n*Chat between ${senderName} (Client/Partner) & ${populatedMessage.receiver?.name || 'Receiver'}*\n`;
          if (text) {
            adminMsg += `\n💬 "${text}"`;
          }
          if (fileUrl) {
            adminMsg += `\n📎 Attachment: ${fileUrl}`;
          }
          await sendWhatsAppMessage(adminPhone, adminMsg);
        }
      } catch (whatsappErr) {
        console.error('Error sending chat WhatsApp notification:', whatsappErr);
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a message
router.put('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this message' });
    }
    
    message.text = req.body.text || message.text;
    message.isEdited = true;
    await message.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/read/:bookingId', protect, async (req, res) => {
  try {
    const currentBooking = await Contact.findById(req.params.bookingId);
    if (!currentBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let query = { user: currentBooking.user };
    if (currentBooking.service) {
      query.service = currentBooking.service;
    } else {
      query.service = { $exists: false };
    }

    const allBookings = await Contact.find(query);
    const bookingIds = allBookings.map(b => b._id);

    await Message.updateMany(
      { booking: { $in: bookingIds }, receiver: req.user._id },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
