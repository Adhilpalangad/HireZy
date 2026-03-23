const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/conversations — Get all conversations for the logged in user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name role isOnline lastSeen')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/messages/conversations — Get or Create a conversation with another user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId, jobId, jobTitle } = req.body;

    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required.' });
    if (userId.toString() === otherUserId.toString()) {
      return res.status(400).json({ message: 'Cannot chat with yourself.' });
    }

    // Attempt to find existing
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    }).populate('participants', 'name role isOnline lastSeen');

    // Create if not exists
    if (!conversation) {
      const newConv = new Conversation({
        participants: [userId, otherUserId],
        jobId: jobId || null,
        jobTitle: jobTitle || ''
      });
      await newConv.save();
      conversation = await Conversation.findById(newConv._id).populate('participants', 'name role isOnline lastSeen');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get/Create Conversation Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/messages/:conversationId — Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/messages/:conversationId — Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Verify user is in conversation
    const isParticipant = conversation.participants.some(p => p.toString() === senderId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized to participate in this conversation.' });
    }

    const user = await User.findById(senderId).select('name');

    const message = new Message({
      conversationId,
      senderId,
      senderName: user.name,
      content: content.trim()
    });

    await message.save();

    // Update conversation lastMessage
    conversation.lastMessage = content.trim();
    conversation.lastSenderId = senderId;
    await conversation.save();

    // Emit Real-time message
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId.toString()).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
