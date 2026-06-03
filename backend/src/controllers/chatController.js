const prisma = require('../db');
const { hasChatModels } = require('../utils/chatModels');
const { getIo } = require('../socket');

const CHAT_SETUP_HINT =
  'Chat database not ready. Stop the server, run: npx prisma db push && npx prisma generate, then npm run dev';

const customerSelect = {
  id: true,
  name: true,
  email: true,
  profileImage: true,
};

function formatMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderRole: message.senderRole,
    body: message.body,
    readAt: message.readAt,
    createdAt: message.createdAt,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          profileImage: message.sender.profileImage,
        }
      : undefined,
  };
}

async function getConversationForUser(conversationId, user) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { customer: { select: customerSelect } },
  });

  if (!conversation) return null;
  if (user.role === 'admin') return conversation;
  if (conversation.customerId === user.id) return conversation;
  return null;
}

async function countUnread(conversationId, forRole) {
  if (!hasChatModels()) return 0;
  const senderRole = forRole === 'admin' ? 'customer' : 'admin';
  return prisma.chatMessage.count({
    where: {
      conversationId,
      senderRole,
      readAt: null,
    },
  });
}

const getMyConversation = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.json({ conversation: null, messages: [], unreadCount: 0, warning: CHAT_SETUP_HINT });
    }
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can use this endpoint.' });
    }

    let conversation = await prisma.conversation.findUnique({
      where: { customerId: req.user.id },
      include: {
        customer: { select: customerSelect },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 200,
          include: {
            sender: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });

    if (!conversation) {
      return res.json({ conversation: null, messages: [], unreadCount: 0 });
    }

    const unreadCount = await countUnread(conversation.id, 'customer');

    res.json({
      conversation: {
        id: conversation.id,
        customerId: conversation.customerId,
        customer: conversation.customer,
        updatedAt: conversation.updatedAt,
      },
      messages: conversation.messages.map(formatMessage),
      unreadCount,
    });
  } catch (error) {
    console.error('Get my conversation error:', error);
    res.status(500).json({ error: 'Could not load chat.' });
  }
};

const listConversations = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.json({ conversations: [], totalUnread: 0, warning: CHAT_SETUP_HINT });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    const conversations = await prisma.conversation.findMany({
      include: {
        customer: { select: customerSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await countUnread(conv.id, 'admin');
        const lastMessage = conv.messages[0];
        return {
          id: conv.id,
          customerId: conv.customerId,
          customer: conv.customer,
          updatedAt: conv.updatedAt,
          lastMessage: lastMessage ? formatMessage(lastMessage) : null,
          unreadCount,
        };
      })
    );

    const totalUnread = enriched.reduce((sum, c) => sum + c.unreadCount, 0);

    res.json({ conversations: enriched, totalUnread });
  } catch (error) {
    if (!hasChatModels()) {
      return res.json({ conversations: [], totalUnread: 0 });
    }
    console.error('List conversations error:', error.message);
    res.status(500).json({ error: 'Could not load conversations.' });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.status(503).json({ error: CHAT_SETUP_HINT });
    }
    const { id } = req.params;
    const conversation = await getConversationForUser(id, req.user);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 300,
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
      },
    });

    const unreadCount = await countUnread(
      id,
      req.user.role === 'admin' ? 'admin' : 'customer'
    );

    res.json({
      conversation: {
        id: conversation.id,
        customerId: conversation.customerId,
        customer: conversation.customer,
        updatedAt: conversation.updatedAt,
      },
      messages: messages.map(formatMessage),
      unreadCount,
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ error: 'Could not load messages.' });
  }
};

const sendMessage = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.status(503).json({ error: CHAT_SETUP_HINT });
    }
    const { body } = req.body;
    const trimmed = typeof body === 'string' ? body.trim() : '';

    if (!trimmed) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (trimmed.length > 2000) {
      return res.status(400).json({ error: 'Message is too long (max 2000 characters).' });
    }

    const senderRole = req.user.role === 'admin' ? 'admin' : 'customer';
    let conversationId = req.params.id;

    if (senderRole === 'customer') {
      let conversation = await prisma.conversation.findUnique({
        where: { customerId: req.user.id },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { customerId: req.user.id },
        });
      }
      conversationId = conversation.id;
    } else {
      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation id is required.' });
      }
      const conversation = await getConversationForUser(conversationId, req.user);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: req.user.id,
        senderRole,
        body: trimmed,
      },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Emit real-time event to everyone in the conversation room
    const formatted = formatMessage(message);
    const io = getIo();
    if (io) {
      io.to(`conv:${conversationId}`).emit('new_message', formatted);
      // Notify admin inbox so unread badge updates without a full page refresh
      io.to('admin_room').emit('conversation_updated', {
        conversationId,
        lastMessage: formatted,
      });
    }

    res.status(201).json({
      message: formatted,
      conversationId,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Could not send message.' });
  }
};

const markConversationRead = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.json({ message: 'Marked as read.' });
    }
    const { id } = req.params;
    const conversation = await getConversationForUser(id, req.user);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const senderRole = req.user.role === 'admin' ? 'customer' : 'admin';

    await prisma.chatMessage.updateMany({
      where: {
        conversationId: id,
        senderRole,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({ message: 'Marked as read.' });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ error: 'Could not mark messages as read.' });
  }
};

const getUnreadTotal = async (req, res) => {
  try {
    if (!hasChatModels()) {
      return res.json({ count: 0 });
    }

    if (req.user.role === 'admin') {
      const conversations = await prisma.conversation.findMany({
        select: { id: true },
      });
      let total = 0;
      for (const conv of conversations) {
        total += await countUnread(conv.id, 'admin');
      }
      return res.json({ count: total });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { customerId: req.user.id },
      select: { id: true },
    });

    if (!conversation) {
      return res.json({ count: 0 });
    }

    const count = await countUnread(conversation.id, 'customer');
    res.json({ count });
  } catch (error) {
    if (!hasChatModels()) {
      return res.json({ count: 0 });
    }
    console.error('Chat unread total error:', error.message);
    res.status(500).json({ error: 'Could not load unread count.' });
  }
};

module.exports = {
  getMyConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getUnreadTotal,
};
