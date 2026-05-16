const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  phone: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'concert', 'festival', 'conference', 'private', 'catering', 'photography', 'videography', 'decoration', 'music', 'security', 'total_event_organisation', 'other'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 1000
  },
  budget: {
    type: String,
    default: ''
  },
  eventDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'accepted', 'rejected', 'completed'],
    default: 'new'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  finalPrice: {
    type: Number,
    default: null
  },
  adminNotes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  billing: {
    items: [{
      description: String,
      amount: Number
    }],
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
