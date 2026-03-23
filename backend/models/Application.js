const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle:     { type: String, required: true },
  seekerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seekerName:   { type: String, required: true },
  recruiterId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverMessage: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  selectedTimeSlot: {
    type: String,
    default: ''
  },
  meetLink: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['none', 'requested', 'paid'],
    default: 'none'
  }
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
