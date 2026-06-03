require('dotenv').config();
const prisma = require('../src/db');

async function main() {
  const order = await prisma.order.findFirst({
    where: { customerEmail: { contains: 'nishant' } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Order:', order);

  const notifs = order?.userId
    ? await prisma.notification.findMany({ where: { userId: order.userId } })
    : [];
  console.log('Notifications:', notifs.length, notifs);
}

main()
  .finally(() => prisma.$disconnect());
