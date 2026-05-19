const mongoose = require('mongoose');

const providerApplicationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  serviceType: {
    type: String,
    enum: ['catering', 'photography', 'videography', 'decoration', 'music', 'security', 'total_event_organisation'],
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instagram: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProviderApplication', providerApplicationSchema);
