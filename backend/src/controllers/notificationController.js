const prisma = require('../db');
const { syncOrderStatusNotificationsForUser } = require('../utils/orderNotifications');

const getMyNotifications = async (req, res) => {
  try {
    try {
      await syncOrderStatusNotificationsForUser(req.user.id);
    } catch (syncErr) {
      console.warn('Notification sync skipped:', syncErr.message);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Could not load notifications.' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    try {
      await syncOrderStatusNotificationsForUser(req.user.id);
    } catch (syncErr) {
      console.warn('Notification sync skipped:', syncErr.message);
    }

    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Could not load notification count.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Could not update notification.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Could not update notifications.' });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
