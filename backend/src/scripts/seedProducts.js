/**
 * Chadani Cosmetic — DELETE all products + RE-SEED with Mamaearth products
 * Run: node backend/src/scripts/seedProducts.js
 */

const https = require('https');

const API_BASE = 'chadani-cosmetic-backend.onrender.com';
const ADMIN_CREDENTIALS = { email: 'admin@chadanicosmetic.com', password: 'admin123' };

// ─── MAMAEARTH PRODUCTS with real Mamaearth CDN images ────────────────────────
const CATEGORIES_TO_ENSURE = [
  { name: 'Skincare',   description: 'Face washes, serums, moisturizers and treatments by Mamaearth.' },
  { name: 'Haircare',  description: 'Shampoos, conditioners, oils and masks by Mamaearth.' },
  { name: 'Cosmetics', description: 'Lip care, kajal and everyday makeup by Mamaearth.' },
  { name: 'Body Care', description: 'Body lotions, sunscreens and personal care by Mamaearth.' },
  { name: 'Bangles',   description: 'Traditional and contemporary bangles for every occasion.' },
];

const PRODUCTS = [
  // ── SKINCARE ──────────────────────────────────────────────────
  {
    category: 'Skincare',
    name: 'Mamaearth Vitamin C Face Wash',
    description: 'Mamaearth Vitamin C Face Wash with Vitamin C & Turmeric for Skin Illumination. Removes tan, reduces dark spots & pigmentation. 100ml.',
    price: 249, stock: 50,
    image: 'https://mamaearth.in/cdn/shop/files/vitamin_c_foaming_face_wash_1.jpg?v=1777969614',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Onion Face Wash',
    description: 'Mamaearth Onion Face Wash with Onion & Neem for Acne Control & Oil-free Skin. Reduces pimples & controls excess oil. 100ml.',
    price: 249, stock: 60,
    image: 'https://mamaearth.in/cdn/shop/files/1_229.jpg?v=1777975333',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Ubtan Face Wash',
    description: 'Mamaearth Ubtan Face Wash with Turmeric & Saffron for Radiant Skin. Traditional ubtan formula for glowing, even-toned skin. 100ml.',
    price: 249, stock: 55,
    image: 'https://mamaearth.in/cdn/shop/files/multani_mitti_fw_100g.jpg?v=1777973159',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Charcoal Face Wash',
    description: 'Mamaearth Charcoal Face Wash with Activated Charcoal & Coffee for Deep Cleansing. Removes pollution, excess oil & impurities. 100ml.',
    price: 249, stock: 45,
    image: 'https://mamaearth.in/cdn/shop/files/1_197.jpg?v=1777975834',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Vitamin C Daily Glow Face Cream',
    description: 'Mamaearth Vitamin C Daily Glow Face Cream with Vitamin C & Turmeric for Skin Illumination. Brightens & moisturises skin. 25g.',
    price: 349, stock: 40,
    image: 'https://mamaearth.in/cdn/shop/files/1_220.jpg?v=1777969740',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Skin Illuminate Vitamin C Serum',
    description: 'Mamaearth Skin Illuminate Vitamin C Face Serum with Vitamin C & Turmeric. Reduces dark spots, evens skin tone. 30ml.',
    price: 549, stock: 35,
    image: 'https://mamaearth.in/cdn/shop/files/1-with-ingredients_3.jpg?v=1777973908',
  },
  {
    category: 'Skincare',
    name: 'Mamaearth Aqua Glow Watermelon Face Serum',
    description: 'Mamaearth Aqua Glow Watermelon Face Serum with Watermelon & Hyaluronic Acid for Hydrated, Glowing Skin. 30ml.',
    price: 499, stock: 30,
    image: 'https://mamaearth.in/cdn/shop/files/1_48.jpg?v=1777974674',
  },

  // ── HAIRCARE ──────────────────────────────────────────────────
  {
    category: 'Haircare',
    name: 'Mamaearth Onion Hair Oil',
    description: 'Mamaearth Onion Hair Oil for Hair Regrowth & Hair Fall Control with Redensyl. Reduces hair fall & promotes hair growth. 250ml.',
    price: 349, stock: 60,
    image: 'https://mamaearth.in/cdn/shop/files/onion_hair_oil_200ml_fop_1200x1200_bf37c81b-4476-4245-a2e9-60a6bcc1dc55.png?v=1778049998',
  },
  {
    category: 'Haircare',
    name: 'Mamaearth Onion Shampoo',
    description: 'Mamaearth Onion Shampoo for Hair Fall Control with Plant Keratin & Onion. Visibly reduces hair fall from first wash. 250ml.',
    price: 349, stock: 55,
    image: 'https://mamaearth.in/cdn/shop/files/onion_shampoo_1l.jpg?v=1777970532',
  },
  {
    category: 'Haircare',
    name: 'Mamaearth Bhringraj Hair Oil',
    description: 'Mamaearth Bhringraj Oil for Faster Hair Growth with Bhringraj & Sesame Oil. Strengthens hair, reduces greying. 200ml.',
    price: 299, stock: 50,
    image: 'https://mamaearth.in/cdn/shop/files/onion-oil-250ml__1_1_1.jpg?v=1777974267',
  },
  {
    category: 'Haircare',
    name: 'Mamaearth Biotin Shampoo',
    description: 'Mamaearth Biotin Shampoo for Hair Growth & Thickness with Biotin & Wheat Protein. Strengthens thin and damaged hair. 250ml.',
    price: 349, stock: 45,
    image: 'https://mamaearth.in/cdn/shop/files/pdp_fop_10.jpg?v=1777975591',
  },
  {
    category: 'Haircare',
    name: 'Mamaearth Argan Hair Mask',
    description: 'Mamaearth Argan Hair Mask with Argan Oil & Avocado for Intense Conditioning. Deeply nourishes, reduces frizz. 200ml.',
    price: 399, stock: 35,
    image: 'https://mamaearth.in/cdn/shop/files/pdp_fop_12.jpg?v=1777975998',
  },
  {
    category: 'Haircare',
    name: 'Mamaearth Rice Water Shampoo',
    description: 'Mamaearth Rice Water Shampoo for Healthy & Shiny Hair with Rice Water & Keratin. Smoothens, adds shine & strength. 250ml.',
    price: 349, stock: 40,
    image: 'https://mamaearth.in/cdn/shop/files/1_1_1125aea9-d5ad-4080-97b3-7a8736611e21.jpg?v=1787737680',
  },

  // ── COSMETICS ─────────────────────────────────────────────────
  {
    category: 'Cosmetics',
    name: 'Mamaearth Tinted Lip Balm — Peach',
    description: 'Mamaearth Tinted Lip Balm with Shea Butter & Vitamin E for Intense Moisturisation. Natural peach tint, long lasting nourishment. 4.5g.',
    price: 199, stock: 80,
    image: 'https://mamaearth.in/cdn/shop/files/3_1.png?v=1777973303',
  },
  {
    category: 'Cosmetics',
    name: 'Mamaearth Natural Kajal',
    description: 'Mamaearth Natural Kajal with Castor Oil & Almond Oil for Defined Eyes. Smudge-proof, long-lasting & gentle formula. 0.35g.',
    price: 149, stock: 100,
    image: 'https://mamaearth.in/cdn/shop/files/3_1_1_1.png?v=1777973335',
  },

  // ── BODY CARE ─────────────────────────────────────────────────
  {
    category: 'Body Care',
    name: 'Mamaearth Ubtan Body Lotion',
    description: 'Mamaearth Ubtan Body Lotion with Turmeric & Saffron for Skin Brightening. Deeply moisturises & brightens body skin. 200ml.',
    price: 349, stock: 45,
    image: 'https://mamaearth.in/cdn/shop/files/3_78.jpg?v=1777974222',
  },
  {
    category: 'Body Care',
    name: 'Mamaearth Vitamin C SPF 50 Sunscreen',
    description: 'Mamaearth Vitamin C SPF 50 Sunscreen with Vitamin C & Turmeric. Lightweight, no white cast, matte finish. 80ml.',
    price: 399, stock: 50,
    image: 'https://mamaearth.in/cdn/shop/files/1_35.jpg?v=1777974509',
  },
  {
    category: 'Body Care',
    name: 'Mamaearth Milky Soft Body Lotion',
    description: 'Mamaearth Milky Soft Body Lotion with Milk Proteins & Oat for 24hr Moisturisation. Non-greasy, fast-absorbing. 400ml.',
    price: 299, stock: 40,
    image: 'https://mamaearth.in/cdn/shop/files/1.jpg?v=1787737556',
  },

  // ── BANGLES ───────────────────────────────────────────────────
  {
    category: 'Bangles',
    name: 'Glass Bangle Set — Red & Gold',
    description: 'Traditional red and gold glass bangles, perfect for weddings, festivals and everyday elegance. Set of 12.',
    price: 199, stock: 80,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
  },
  {
    category: 'Bangles',
    name: 'Lac Bridal Bangle Set',
    description: 'Handcrafted lac bangles with intricate gold work. Bridal collection set of 6, available in multiple sizes.',
    price: 449, stock: 40,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=600',
  },
  {
    category: 'Bangles',
    name: 'Rose Gold Metal Bangles',
    description: 'Contemporary rose gold metal bangles with stone embellishments. Set of 4, perfect for daily and party wear.',
    price: 349, stock: 55,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=80&w=600',
  },
  {
    category: 'Bangles',
    name: 'Silk Thread Bangles — Multicolour',
    description: 'Handmade silk thread wrapped bangles in vibrant festive colours. Set of 6, lightweight and comfortable.',
    price: 249, stock: 70,
    image: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?auto=format&fit=crop&q=80&w=600',
  },
];

// ─── HTTP Helper ───────────────────────────────────────────────────────────────
function apiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: API_BASE,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
        } catch { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌿 Chadani Cosmetic — Delete All & Re-seed with Mamaearth Products');
  console.log('━'.repeat(60));

  // 1. Login
  console.log('\n🔐 Logging in...');
  let token;
  try {
    const res = await apiRequest('POST', '/auth/login', ADMIN_CREDENTIALS);
    token = res.token;
    if (!token) throw new Error('No token');
    console.log('✅ Login successful');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  // 2. Fetch all existing products
  console.log('\n🗑️  Fetching existing products to delete...');
  let existingProducts = [];
  try {
    existingProducts = await apiRequest('GET', '/products', null, token);
    if (!Array.isArray(existingProducts)) existingProducts = [];
  } catch (err) {
    console.error('  ⚠️  Could not fetch products:', err.message);
  }
  console.log(`  Found ${existingProducts.length} products to delete`);

  // 3. Delete all existing products
  let deleted = 0;
  for (const p of existingProducts) {
    try {
      await apiRequest('DELETE', `/products/${p.id}`, null, token);
      console.log(`  🗑️  Deleted: ${p.name}`);
      deleted++;
    } catch (err) {
      console.error(`  ❌ Could not delete ${p.name}: ${err.message}`);
    }
    await sleep(150);
  }
  console.log(`\n  ✅ Deleted ${deleted} products`);

  // 4. Fetch existing categories
  let existing = [];
  try {
    existing = await apiRequest('GET', '/categories', null, token);
    if (!Array.isArray(existing)) existing = [];
  } catch {}
  const categoryMap = {};
  existing.forEach((c) => { categoryMap[c.name.toLowerCase()] = c.id; });
  console.log(`\n📂 Found ${existing.length} existing categories`);

  // 5. Ensure categories exist
  console.log('\n📁 Ensuring categories...');
  for (const cat of CATEGORIES_TO_ENSURE) {
    const key = cat.name.toLowerCase();
    if (!categoryMap[key]) {
      const partialMatch = existing.find(
        (c) => c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase())
      );
      if (partialMatch) {
        categoryMap[key] = partialMatch.id;
        console.log(`  ✓ Matched: ${partialMatch.name}`);
        continue;
      }
      try {
        const created = await apiRequest('POST', '/categories', cat, token);
        categoryMap[key] = created.id;
        console.log(`  ✅ Created: ${cat.name}`);
      } catch (err) {
        console.error(`  ❌ Failed to create ${cat.name}: ${err.message}`);
      }
      await sleep(350);
    } else {
      console.log(`  ✓ Exists: ${cat.name}`);
    }
  }

  // 6. Add Mamaearth products
  console.log('\n🛍️  Adding Mamaearth products...');
  let success = 0;
  let failed = 0;

  for (const product of PRODUCTS) {
    const key = product.category.toLowerCase();
    const categoryId = categoryMap[key];
    if (!categoryId) {
      console.error(`  ❌ No category for "${product.category}" — skipping: ${product.name}`);
      failed++;
      continue;
    }
    try {
      await apiRequest('POST', '/products', {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId,
      }, token);
      console.log(`  ✅ ${product.name} — Rs. ${product.price}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${product.name}: ${err.message}`);
      failed++;
    }
    await sleep(200);
  }

  console.log('\n━'.repeat(60));
  console.log(`✅ Done! ${success} products added, ${failed} failed.`);
  console.log('🌐 Live site: https://chadani-cosmetic.vercel.app\n');
}

main().catch((err) => { console.error('Fatal:', err.message); process.exit(1); });

