/**
 * Copies existing Product.image into ProductImage rows (one per product).
 * Run: node scripts/migrate-product-images.js
 */
require('dotenv').config();
const prisma = require('../src/db');

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { not: null } },
    select: { id: true, image: true },
  });

  let created = 0;
  for (const product of products) {
    const existing = await prisma.productImage.count({
      where: { productId: product.id },
    });
    if (existing > 0) continue;

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: product.image,
        sortOrder: 0,
      },
    });
    created += 1;
  }

  console.log(`Migrated ${created} product(s) to ProductImage gallery.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
