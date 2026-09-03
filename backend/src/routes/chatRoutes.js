const express = require('express');
const {
  getMyConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
  uploadChatMedia,
  markConversationRead,
  getUnreadTotal,
} = require('../controllers/chatController');
const { uploadChatMediaMulter } = require('../utils/chatMediaStorage');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateUser);

router.get('/unread-count', getUnreadTotal);
router.get('/me', getMyConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/messages', sendMessage);
router.post('/upload', uploadChatMediaMulter.single('file'), uploadChatMedia);
router.patch('/conversations/:id/read', markConversationRead);

module.exports = router;
