const prisma = require('../db');

const NOTIFY_STATUSES = ['confirmed', 'shipped', 'delivered', 'cancelled'];

function getStatusNotificationContent(status, orderId) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  const map = {
    confirmed: {
      title: 'Order confirmed',
      message: `Your order #${shortId} has been confirmed and is being prepared.`,
    },
    shipped: {
      title: 'Order shipped',
      message: `Your order #${shortId} has been shipped and is on the way to you.`,
    },
    delivered: {
      title: 'Order delivered',
      message: `Your order #${shortId} has been delivered. Thank you for shopping with Chadani Cosmetic!`,
    },
    cancelled: {
      title: 'Order cancelled',
      message: `Your order #${shortId} has been cancelled. Contact us if you need help.`,
    },
  };

  return (
    map[status] || {
      title: 'Order updated',
      message: `Your order #${shortId} status is now "${status}".`,
    }
  );
}

async function createOrderStatusNotification(userId, orderId, status) {
  if (!userId || !NOTIFY_STATUSES.includes(status)) return null;

  const { title, message } = getStatusNotificationContent(status, orderId);

  const duplicate = await prisma.notification.findFirst({
    where: { userId, orderId, type: 'order_status', title, message },
  });
  if (duplicate) return duplicate;

  return prisma.notification.create({
    data: {
      userId,
      orderId,
      type: 'order_status',
      title,
      message,
    },
  });
}

/** Create missing notifications for orders already in confirmed/shipped/delivered/cancelled */
async function syncOrderStatusNotificationsForUser(userId) {
  if (!userId) return;

  const orders = await prisma.order.findMany({
    where: {
      userId,
      orderStatus: { in: NOTIFY_STATUSES },
    },
    select: { id: true, orderStatus: true },
  });

  for (const order of orders) {
    const hasNotification = await prisma.notification.findFirst({
      where: { userId, orderId: order.id, type: 'order_status' },
    });
    if (!hasNotification) {
      await createOrderStatusNotification(userId, order.id, order.orderStatus);
    }
  }
}

async function resolveNotifyUserId(order) {
  if (order.userId) return order.userId;
  const email = (order.customerEmail || order.user?.email || '').trim().toLowerCase();
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id || null;
}

module.exports = {
  NOTIFY_STATUSES,
  getStatusNotificationContent,
  createOrderStatusNotification,
  syncOrderStatusNotificationsForUser,
  resolveNotifyUserId,
};
