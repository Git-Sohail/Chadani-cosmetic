require('dotenv').config();
const prisma = require('../src/db');
const { syncOrderStatusNotificationsForUser } = require('../src/utils/orderNotifications');

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/sync-notifications.js <userId>');
  process.exit(1);
}

syncOrderStatusNotificationsForUser(userId)
  .then(async () => {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Notifications:', list.length);
    list.forEach((n) => console.log('-', n.title, '|', n.message));
  })
  .finally(() => prisma.$disconnect());
