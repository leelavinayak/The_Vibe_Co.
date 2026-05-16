const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: false
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', null],
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
