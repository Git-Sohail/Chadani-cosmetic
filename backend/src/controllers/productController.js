const prisma = require('../db');
const {
  getProductInclude,
  hasProductImageModel,
  attachImagesToProducts,
  parseImageUrls,
  formatProduct,
  formatProducts,
  syncProductImages,
} = require('../utils/productImages');

const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, featured, sale } = req.query;

    const where = {};

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (sale === 'true') {
      where.isSale = true;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'priceAsc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'priceDesc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: getProductInclude(),
    });

    const withImages = await attachImagesToProducts(products);
    res.json(formatProducts(withImages));
  } catch (error) {
    console.error('Get products error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const hint =
      error?.code === 'P2021' || /productImage|ProductImage/i.test(error?.message || '')
        ? 'Database schema may be out of date. Run: npx prisma db push && npx prisma generate (restart backend).'
        : undefined;
    res.status(500).json({
      error: 'Server error fetching products.',
      ...(isDev && { details: error.message, hint }),
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: getProductInclude(),
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      take: 4,
      include: getProductInclude(),
    });

    const [productWithImages] = await attachImagesToProducts([product]);
    const relatedWithImages = await attachImagesToProducts(relatedProducts);

    res.json({
      product: formatProduct(productWithImages),
      relatedProducts: formatProducts(relatedWithImages),
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: 'Server error fetching product details.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      oldPrice,
      image,
      images,
      sku,
      categoryId,
      stock,
      rating,
      isFeatured,
      isSale,
    } = req.body;

    if (!name || !description || price === undefined || !categoryId) {
      return res
        .status(400)
        .json({ error: 'Name, description, price, and categoryId are required fields.' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Original price must be a valid non-negative number.' });
    }

    let parsedDiscountPrice = null;
    if (discountPrice !== undefined && discountPrice !== null && discountPrice !== '') {
      parsedDiscountPrice = parseFloat(discountPrice);
      if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
        return res.status(400).json({ error: 'Discount price must be a valid non-negative number.' });
      }
      if (parsedDiscountPrice > parsedPrice) {
        return res.status(400).json({ error: 'Discount price cannot exceed original price.' });
      }
    }

    if (images !== undefined && !hasProductImageModel()) {
      return res.status(503).json({
        error:
          'Product gallery is unavailable. Stop the backend, run "npx prisma generate", then restart.',
      });
    }

    const imageUrls = parseImageUrls(images, image);
    const primaryImage = imageUrls[0] || null;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          description,
          price: parsedPrice,
          discountPrice: parsedDiscountPrice,
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          image: primaryImage,
          sku: sku || '',
          categoryId,
          stock: parseInt(stock) || 0,
          rating: parseFloat(rating) || 5.0,
          isFeatured: isFeatured === true || isFeatured === 'true',
          isSale: isSale === true || isSale === 'true',
        },
      });

      await syncProductImages(created.id, imageUrls, tx);

      return tx.product.findUnique({
        where: { id: created.id },
        include: getProductInclude(),
      });
    });

    const [withImages] = await attachImagesToProducts([product]);
    res.status(201).json(formatProduct(withImages));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error creating product.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountPrice,
      oldPrice,
      image,
      images,
      sku,
      categoryId,
      stock,
      rating,
      isFeatured,
      isSale,
    } = req.body;

    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;

    let targetPrice = currentProduct.price;
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Original price must be a valid non-negative number.' });
      }
      data.price = parsedPrice;
      targetPrice = parsedPrice;
    }

    if (discountPrice !== undefined) {
      if (discountPrice === null || discountPrice === '') {
        data.discountPrice = null;
      } else {
        const parsedDiscount = parseFloat(discountPrice);
        if (isNaN(parsedDiscount) || parsedDiscount < 0) {
          return res.status(400).json({ error: 'Discount price must be a valid non-negative number.' });
        }
        if (parsedDiscount > targetPrice) {
          return res.status(400).json({ error: 'Discount price cannot exceed original price.' });
        }
        data.discountPrice = parsedDiscount;
      }
    }
    if (oldPrice !== undefined) data.oldPrice = oldPrice ? parseFloat(oldPrice) : null;
    if (sku !== undefined) data.sku = sku;
    if (categoryId) data.categoryId = categoryId;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (isFeatured !== undefined) data.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isSale !== undefined) data.isSale = isSale === true || isSale === 'true';

    if (images !== undefined && !hasProductImageModel()) {
      return res.status(503).json({
        error:
          'Product gallery is unavailable. Stop the backend, run "npx prisma generate", then restart.',
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        const imageUrls = parseImageUrls(images, image);
        data.image = imageUrls[0] || null;
        await tx.product.update({ where: { id }, data });
        await syncProductImages(id, imageUrls, tx);
      } else if (image !== undefined) {
        data.image = image || null;
        await tx.product.update({ where: { id }, data });
        if (image) {
          await syncProductImages(id, [image], tx);
        } else {
          await syncProductImages(id, [], tx);
        }
      } else if (Object.keys(data).length) {
        await tx.product.update({ where: { id }, data });
      }

      return tx.product.findUnique({
        where: { id },
        include: getProductInclude(),
      });
    });

    const [withImages] = await attachImagesToProducts([product]);
    res.json(formatProduct(withImages));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error updating product.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
