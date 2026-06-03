const prisma = require('../db');

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            oldPrice: true,
            image: true,
            stock: true,
            category: { select: { name: true } }
          }
        }
      }
    });
    res.json(wishlistItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Server error fetching wishlist items.' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ProductId is required.' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existingItem) {
      return res.status(200).json({ message: 'Product is already in wishlist.', item: existingItem });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true }
    });

    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Server error adding to wishlist.' });
  }
};

const deleteFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Wishlist item ID or Product ID? Let's check both or support dynamic lookup.
    // The prompt says: DELETE /api/wishlist/:id where :id is the wishlist ID. Let's check if the ID passed is the wishlist item ID.
    
    const wishlistItem = await prisma.wishlist.findUnique({ where: { id } });
    if (!wishlistItem || wishlistItem.userId !== userId) {
      // Let's also check if the passed parameter is the Product ID, in case the frontend sends the product ID instead
      const itemByProduct = await prisma.wishlist.findFirst({
        where: { userId, productId: id }
      });
      if (!itemByProduct) {
        return res.status(404).json({ error: 'Wishlist item not found.' });
      }
      await prisma.wishlist.delete({ where: { id: itemByProduct.id } });
      return res.json({ message: 'Product removed from wishlist.' });
    }

    await prisma.wishlist.delete({ where: { id } });
    res.json({ message: 'Product removed from wishlist.' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ error: 'Server error removing from wishlist.' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  deleteFromWishlist
};
