const prisma = require('../db');

function hasProductImageModel() {
  return typeof prisma.productImage?.findMany === 'function';
}

const productImagesInclude = {
  productImages: {
    orderBy: { sortOrder: 'asc' },
    select: { id: true, url: true, sortOrder: true },
  },
};

function getProductInclude() {
  const base = {
    category: { select: { name: true } },
  };
  if (hasProductImageModel()) {
    return { ...base, ...productImagesInclude };
  }
  return base;
}

async function attachImagesToProducts(products) {
  if (!products?.length || !hasProductImageModel()) {
    return products;
  }

  if (products.every((p) => Array.isArray(p.productImages))) {
    return products;
  }

  const ids = products.map((p) => p.id);
  const rows = await prisma.productImage.findMany({
    where: { productId: { in: ids } },
    orderBy: { sortOrder: 'asc' },
    select: { productId: true, url: true, sortOrder: true },
  });

  const byProduct = {};
  for (const row of rows) {
    if (!byProduct[row.productId]) byProduct[row.productId] = [];
    byProduct[row.productId].push(row);
  }

  return products.map((product) => ({
    ...product,
    productImages: byProduct[product.id] || product.productImages || [],
  }));
}

function parseImageUrls(images, fallbackImage) {
  if (Array.isArray(images)) {
    const urls = images
      .map((item) => (typeof item === 'string' ? item : item?.url))
      .filter((url) => typeof url === 'string' && url.trim())
      .map((url) => url.trim());
    if (urls.length) return urls;
  }
  if (typeof fallbackImage === 'string' && fallbackImage.trim()) {
    return [fallbackImage.trim()];
  }
  return [];
}

function formatProduct(product) {
  if (!product) return product;

  const gallery = (product.productImages || []).map((row) => row.url);
  const images = gallery.length ? gallery : product.image ? [product.image] : [];

  const { productImages, ...rest } = product;
  return {
    ...rest,
    image: images[0] || product.image || null,
    images,
  };
}

function formatProducts(products) {
  return products.map(formatProduct);
}

async function syncProductImages(productId, imageUrls, db = prisma) {
  const urls = parseImageUrls(imageUrls);

  await db.productImage.deleteMany({ where: { productId } });

  if (urls.length) {
    await db.productImage.createMany({
      data: urls.map((url, index) => ({
        productId,
        url,
        sortOrder: index,
      })),
    });
  }

  return urls[0] || null;
}

module.exports = {
  productImagesInclude,
  getProductInclude,
  hasProductImageModel,
  attachImagesToProducts,
  parseImageUrls,
  formatProduct,
  formatProducts,
  syncProductImages,
};
