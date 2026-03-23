const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'seeker', 'recruiter'],
    default: 'seeker'
  },
  skills: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  govIdUrl: { type: String, default: '' },

  // Portfolio / Works
  portfolio: [{
    label: { type: String },
    url: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
