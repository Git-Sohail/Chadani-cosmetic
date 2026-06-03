/**
 * Updates category cover images that use broken Cloudinary demo URLs.
 * Run: node scripts/fix-category-images.js
 */
require('dotenv').config();
const prisma = require('../src/db');

const CATEGORY_IMAGES = {
  'Skincare Treatment':
    'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
  'Cosmetics & Makeup':
    'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=600',
  'Traditional Bangles':
    'https://images.unsplash.com/photo-1617038260897-41a608cfd2c1?auto=format&fit=crop&q=80&w=600',
  'Artificial Jewellery':
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600',
  'Hair Accessories':
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8f0?auto=format&fit=crop&q=80&w=600',
};

async function main() {
  for (const [name, image] of Object.entries(CATEGORY_IMAGES)) {
    const result = await prisma.category.updateMany({
      where: { name },
      data: { image },
    });
    console.log(`Updated "${name}": ${result.count} row(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
