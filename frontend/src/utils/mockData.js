export const mockCategories = [
  { id: 'skincare', name: 'Skincare Treatment', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400', count: 12 },
  { id: 'makeup', name: 'Cosmetics & Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400', count: 18 },
  { id: 'bangles', name: 'Traditional Bangles', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400', count: 15 },
  { id: 'jewellery', name: 'Artificial Jewellery', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400', count: 10 },
  { id: 'hair-accessories', name: 'Hair Accessories', image: 'https://images.unsplash.com/photo-1631214524020-5e1839765c71?auto=format&fit=crop&q=80&w=400', count: 8 },
];

export const mockProducts = [
  // Skincare
  {
    id: 'p1',
    name: 'Glow Boosting Vitamin C Serum',
    price: 29.99,
    oldPrice: 39.99,
    description: 'Infused with active Vitamin C and Hyaluronic Acid to intensely hydrate, clear blemishes, and bring out your natural skin glow.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    categoryId: 'skincare',
    category: { name: 'Skincare Treatment' },
    stock: 15,
    rating: 4.8,
    isFeatured: true,
    isSale: true,
  },
  {
    id: 'p2',
    name: 'Hydrating Rose Water Toner',
    price: 14.99,
    oldPrice: 19.99,
    description: 'Pure, organic steam-distilled rose water. Soothes irritation, balances skin pH, and acts as a perfect setting spray.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800',
    categoryId: 'skincare',
    category: { name: 'Skincare Treatment' },
    stock: 25,
    rating: 4.9,
    isFeatured: true,
    isSale: false,
  },
  
  // Makeup
  {
    id: 'p3',
    name: 'Velvet Matte Longwear Lipstick',
    price: 18.99,
    oldPrice: null,
    description: 'A creamy, transfer-proof matte lipstick with rich pigment that lasts up to 16 hours without drying your lips.',
    image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=800',
    categoryId: 'makeup',
    category: { name: 'Cosmetics & Makeup' },
    stock: 8,
    rating: 4.7,
    isFeatured: true,
    isSale: false,
  },
  {
    id: 'p4',
    name: 'Ultra Definition Liquid Foundation',
    price: 24.50,
    oldPrice: 30.00,
    description: 'Medium-to-full buildable coverage foundation with a natural skin-like finish. Available in 12 blendable shades.',
    image: 'https://images.unsplash.com/photo-1631214499574-5fe1f3f85d1e?auto=format&fit=crop&q=80&w=800',
    categoryId: 'makeup',
    category: { name: 'Cosmetics & Makeup' },
    stock: 3,
    rating: 4.6,
    isFeatured: false,
    isSale: true,
  },

  // Bangles
  {
    id: 'p5',
    name: 'Royal Kundan Gold-Plated Bangle Set',
    price: 45.00,
    oldPrice: 60.00,
    description: 'Stunning traditional Kundan bridal bangle set encrusted with high-quality stones. Ideal for festive and wedding wear.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    categoryId: 'bangles',
    category: { name: 'Traditional Bangles' },
    stock: 6,
    rating: 4.9,
    isFeatured: true,
    isSale: true,
  },
  {
    id: 'p6',
    name: 'Vibrant Glass Bangles (Set of 24)',
    price: 9.99,
    oldPrice: 15.00,
    description: 'Classic handcrafted glass bangles in gorgeous matching pink and maroon shades. A must-have traditional accessory.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    categoryId: 'bangles',
    category: { name: 'Traditional Bangles' },
    stock: 50,
    rating: 4.5,
    isFeatured: false,
    isSale: true,
  },

  // Jewellery
  {
    id: 'p7',
    name: 'Elegant Pearl Drop Choker Necklace',
    price: 34.99,
    oldPrice: null,
    description: 'A gorgeous delicate choker featuring premium faux freshwater pearls and an adjustable 18k gold-plated clasp.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    categoryId: 'jewellery',
    category: { name: 'Artificial Jewellery' },
    stock: 5,
    rating: 4.8,
    isFeatured: true,
    isSale: false,
  },

  // Hair Accessories
  {
    id: 'p8',
    name: 'Silk Satin Hair Scrunchie Gift Pack',
    price: 12.50,
    oldPrice: 18.00,
    description: 'Set of 5 high-grade silk satin scrunchies that prevent hair breakage and add a luxurious touch to any hairstyle.',
    image: 'https://images.unsplash.com/photo-1631214524020-5e1839765c71?auto=format&fit=crop&q=80&w=800',
    categoryId: 'hair-accessories',
    category: { name: 'Hair Accessories' },
    stock: 12,
    rating: 4.7,
    isFeatured: false,
    isSale: true,
  }
];

export const mockReviews = [
  {
    id: 'r1',
    name: 'Amina Khan',
    rating: 5,
    comment: 'The Kundan bangles are absolutely breathtaking! The quality is amazing, and the shine matches gold perfectly.',
    date: 'May 12, 2026'
  },
  {
    id: 'r2',
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Im in love with the Vitamin C Serum. My dark spots have faded significantly in just 2 weeks. Highly recommend Chadani Cosmetic!',
    date: 'May 20, 2026'
  },
  {
    id: 'r3',
    name: 'Priyah Patel',
    rating: 4,
    comment: 'The velvet matte lipstick is very long-lasting. It feels comfortable on the lips. Will definitely buy more shades.',
    date: 'May 25, 2026'
  }
];
