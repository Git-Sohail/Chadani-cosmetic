const prisma = require('../db');

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
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
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error fetching cart items.' });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ProductId is required.' });
    }

    const qty = parseInt(quantity) || 1;

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    if (product.stock < qty) {
      return res.status(400).json({ error: `Only ${product.stock} items left in stock.` });
    }

    // Check if item is already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    let cartItem;
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + qty;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: `Cannot add more. Max stock is ${product.stock}.` });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: qty
        },
        include: { product: true }
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error adding item to cart.' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItem ID
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      return res.status(400).json({ error: 'Valid positive quantity is required.' });
    }

    // Verify item ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ error: `Only ${cartItem.product.stock} items left in stock.` });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity) },
      include: { product: true }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Server error updating cart item.' });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify item ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Server error removing item from cart.' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem
};
