const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['wedding', 'corporate', 'birthday', 'concert', 'festival', 'conference', 'private', 'other']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  capacity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
