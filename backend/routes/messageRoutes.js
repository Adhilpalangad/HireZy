const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.use(authMiddleware);

// Conversations
router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.getOrCreateConversation);

// Messages inside a conversation
router.get('/:conversationId', messageController.getMessages);
router.post('/:conversationId', messageController.sendMessage);

module.exports = router;
