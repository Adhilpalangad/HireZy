const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Local Task', 'Professional Rank'],
    required: true,
  },
  location: {
    type: String,
    default: 'Remote'
  },
  budget: {
    type: String,
    required: true,
  },
  posterName: {
    type: String,
    required: true
  },
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String
  },
  // User-side local job request fields
  peopleNeeded: {
    type: Number,
    default: 1,
    min: 1
  },
  urgency: { type: String, enum: ['ASAP', 'Today', 'This Week', 'Flexible'], default: 'Flexible' },
  postedByRole: { type: String, enum: ['recruiter', 'seeker'], default: 'recruiter' },

  // New Fields for Advance & Meetings
  isShortTerm: { type: Boolean, default: false },
  requiresAdvance: { type: Boolean, default: false },
  availableTimeSlots: [{ type: String }],
  
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
