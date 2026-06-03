const express = require('express');
const {
  getMyConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getUnreadTotal,
} = require('../controllers/chatController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateUser);

router.get('/unread-count', getUnreadTotal);
router.get('/me', getMyConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/messages', sendMessage);
router.patch('/conversations/:id/read', markConversationRead);

module.exports = router;
