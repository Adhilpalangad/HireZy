const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  jobTitle:     { type: String, default: '' },
  lastMessage:  { type: String, default: '' },
  lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
