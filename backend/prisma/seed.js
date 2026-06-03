const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // Clean old data (idempotent full reset)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.otp.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const ADMIN_EMAIL = 'admin@chadanicosmetic.com';
  const ADMIN_PASSWORD_PLAIN = 'admin123';

  // 1. Single admin account — no email verification required at login
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Chadani',
      email: ADMIN_EMAIL,
      password: adminPassword,
      phone: '+1 555-0100',
      role: 'admin',
      isVerified: true, // Admin skips OTP verification
    },
  });

  // Demo customer (verified for easy storefront testing; new signups use OTP flow)
  const customerPassword = await bcrypt.hash('customer123', 10);

  const customer = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: customerPassword,
      phone: '0987654321',
      role: 'customer',
      isVerified: true,
    },
  });

  console.log('\n========================================');
  console.log('SEEDED USERS');
  console.log('========================================');
  console.log('ADMIN (no OTP required):');
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${ADMIN_PASSWORD_PLAIN}`);
  console.log(`  Role:     ${admin.role} | Verified: ${admin.isVerified}`);
  console.log('----------------------------------------');
  console.log('DEMO CUSTOMER:');
  console.log(`  Email:    ${customer.email}`);
  console.log(`  Password: customer123`);
  console.log('========================================\n');

  // 2. Seed Categories
  const skincare = await prisma.category.create({
    data: {
      name: 'Skincare Treatment',
      image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
    },
  });
  const makeup = await prisma.category.create({
    data: {
      name: 'Cosmetics & Makeup',
      image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=600',
    },
  });
  const bangles = await prisma.category.create({
    data: {
      name: 'Traditional Bangles',
      image: 'https://images.unsplash.com/photo-1617038260897-41a608cfd2c1?auto=format&fit=crop&q=80&w=600',
    },
  });
  const jewellery = await prisma.category.create({
    data: {
      name: 'Artificial Jewellery',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600',
    },
  });
  const hairAcc = await prisma.category.create({
    data: {
      name: 'Hair Accessories',
      image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8f0?auto=format&fit=crop&q=80&w=600',
    },
  });

  console.log('Seeded Categories.');

  // 3. Seed Products
  const productsData = [
    // Skincare
    {
      name: 'Glow Boosting Vitamin C Serum',
      price: 29.99,
      oldPrice: 39.99,
      description: 'Infused with active Vitamin C and Hyaluronic Acid to intensely hydrate, clear blemishes, and bring out your natural skin glow.',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      categoryId: skincare.id,
      stock: 15,
      rating: 4.8,
      isFeatured: true,
      isSale: true,
    },
    {
      name: 'Hydrating Rose Water Toner',
      price: 14.99,
      oldPrice: 19.99,
      description: 'Pure, organic steam-distilled rose water. Soothes irritation, balances skin pH, and acts as a perfect makeup setting spray.',
      image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800',
      categoryId: skincare.id,
      stock: 25,
      rating: 4.9,
      isFeatured: true,
      isSale: false,
    },
    {
      name: 'Night Repair Face Oil',
      price: 35.00,
      oldPrice: null,
      description: 'Deeply nourishing botanical oil blend that works overnight to restore skin elasticity and reduce fine lines.',
      image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=800',
      categoryId: skincare.id,
      stock: 10,
      rating: 4.7,
      isFeatured: false,
      isSale: false,
    },

    // Makeup
    {
      name: 'Velvet Matte Longwear Lipstick',
      price: 18.99,
      oldPrice: null,
      description: 'A creamy, transfer-proof matte lipstick with rich pigment that lasts up to 16 hours without drying your lips.',
      image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=800',
      categoryId: makeup.id,
      stock: 8,
      rating: 4.7,
      isFeatured: true,
      isSale: false,
    },
    {
      name: 'Ultra Definition Liquid Foundation',
      price: 24.50,
      oldPrice: 30.00,
      description: 'Medium-to-full buildable coverage foundation with a natural skin-like finish. Available in 12 blendable shades.',
      image: 'https://images.unsplash.com/photo-1631214499574-5fe1f3f85d1e?auto=format&fit=crop&q=80&w=800',
      categoryId: makeup.id,
      stock: 3,
      rating: 4.6,
      isFeatured: false,
      isSale: true,
    },
    {
      name: 'Dramatic Volume Mascara',
      price: 15.00,
      oldPrice: 20.00,
      description: 'Lash-lengthening mascara that adds intense volume and curl without clumping or smudging.',
      image: 'https://images.unsplash.com/photo-1631214524020-5e1839765c71?auto=format&fit=crop&q=80&w=800',
      categoryId: makeup.id,
      stock: 20,
      rating: 4.8,
      isFeatured: true,
      isSale: true,
    },

    // Bangles
    {
      name: 'Royal Kundan Gold-Plated Bangle Set',
      price: 45.00,
      oldPrice: 60.00,
      description: 'Stunning traditional Kundan bridal bangle set encrusted with high-quality stones. Ideal for festive and wedding wear.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
      categoryId: bangles.id,
      stock: 6,
      rating: 4.9,
      isFeatured: true,
      isSale: true,
    },
    {
      name: 'Vibrant Glass Bangles (Set of 24)',
      price: 9.99,
      oldPrice: 15.00,
      description: 'Classic handcrafted glass bangles in gorgeous matching pink and maroon shades. A must-have traditional accessory.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
      categoryId: bangles.id,
      stock: 50,
      rating: 4.5,
      isFeatured: false,
      isSale: true,
    },
    {
      name: 'Antique Oxidized Silver Bangles',
      price: 12.00,
      oldPrice: null,
      description: 'Ethnic style oxidized silver-finish bangles with intricate tribal carvings. Perfect for boho-chic looks.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
      categoryId: bangles.id,
      stock: 15,
      rating: 4.6,
      isFeatured: false,
      isSale: false,
    },

    // Jewellery
    {
      name: 'Elegant Pearl Drop Choker Necklace',
      price: 34.99,
      oldPrice: null,
      description: 'A gorgeous delicate choker featuring premium faux freshwater pearls and an adjustable 18k gold-plated clasp.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      categoryId: jewellery.id,
      stock: 5,
      rating: 4.8,
      isFeatured: true,
      isSale: false,
    },
    {
      name: 'Crystal Studded Drop Earrings',
      price: 25.00,
      oldPrice: 35.00,
      description: 'Sparkling cubic zirconia drop earrings that add a touch of glamour to any evening outfit.',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
      categoryId: jewellery.id,
      stock: 10,
      rating: 4.9,
      isFeatured: true,
      isSale: true,
    },

    // Hair Accessories
    {
      name: 'Silk Satin Hair Scrunchie Gift Pack',
      price: 12.50,
      oldPrice: 18.00,
      description: 'Set of 5 high-grade silk satin scrunchies that prevent hair breakage and add a luxurious touch to any hairstyle.',
      image: 'https://images.unsplash.com/photo-1631214524020-5e1839765c71?auto=format&fit=crop&q=80&w=800',
      categoryId: hairAcc.id,
      stock: 12,
      rating: 4.7,
      isFeatured: false,
      isSale: true,
    },
    {
      name: 'Gold Metallic Butterfly Hair Clips',
      price: 8.00,
      oldPrice: null,
      description: 'Charming pair of butterfly-shaped metal clips with a matte gold finish. Lightweight and secure.',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      categoryId: hairAcc.id,
      stock: 30,
      rating: 4.5,
      isFeatured: true,
      isSale: false,
    }
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: item,
    });
  }

  console.log('Seeded Products.');
  console.log('Seeding process finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
