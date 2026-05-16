const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['catering', 'photography', 'videography', 'decoration', 'music', 'security', 'total_event_organisation'],
    required: true
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  priceStartsFrom: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  instagram: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
