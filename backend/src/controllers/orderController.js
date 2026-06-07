const prisma = require('../db');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email');
const { formatOrder, formatOrders } = require('../utils/orderFormatter');
const {
  createOrderStatusNotification,
  resolveNotifyUserId,
} = require('../utils/orderNotifications');

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      customerName, phone, address,
      city, area, postalCode,
      deliveryWard, deliveryArea, deliveryLandmark,
      deliveryLat, deliveryLng, deliveryMapUrl,
      paymentMethod,
    } = req.body;

    if (!customerName || !phone || !address) {
      return res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
    }

    // Retrieve user's cart items with products and categories
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cannot place order. Your shopping cart is empty.' });
    }

    // Begin database transaction for atomic order placement
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // 1. Validate stock availability and calculate total
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`);
        }
        // Use discount price if available, otherwise regular price
        const activePrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
          ? item.product.discountPrice
          : item.product.price;

        totalAmount += activePrice * item.quantity;
      }

      // 2. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail: req.user.email,
          phone,
          address,
          city: city || null,
          area: area || null,
          postalCode: postalCode || null,
          deliveryWard: deliveryWard || null,
          deliveryArea: deliveryArea || null,
          deliveryLandmark: deliveryLandmark || null,
          deliveryLat: deliveryLat ? parseFloat(deliveryLat) : null,
          deliveryLng: deliveryLng ? parseFloat(deliveryLng) : null,
          deliveryMapUrl: deliveryMapUrl || null,
          totalAmount,
          paymentMethod: paymentMethod || 'Cash on Delivery',
          orderStatus: 'pending',
        },
      });

      // 3. Create order items and decrement product stocks
      for (const item of cartItems) {
        const activePrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
          ? item.product.discountPrice
          : item.product.price;
        const subtotal = activePrice * item.quantity;

        // Create OrderItem snapshot
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            productDescription: item.product.description,
            productImage: item.product.image || null,
            productCategory: item.product.category?.name || 'General',
            sku: item.product.sku || '',
            price: activePrice,
            quantity: item.quantity,
            subtotal: subtotal
          }
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: Math.max(0, item.product.stock - item.quantity)
          }
        });
      }

      // 4. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return order;
    });

    // Fetch complete placed order with items to return to frontend
    const orderDetails = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: true
      }
    });

    // Send confirmation email asynchronously (do not block client response)
    sendOrderConfirmationEmail(orderDetails, req.user.email).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });

    res.status(201).json(formatOrder(orderDetails));
  } catch (error) {
    console.error('Place order error:', error);
    res.status(400).json({ error: error.message || 'Server error placing order.' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(formatOrders(orders));
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(formatOrders(orders));
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Server error fetching all orders.' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(formatOrder(order));
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error fetching order details.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status value.' });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { orderStatus: true, userId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (existing.orderStatus === status) {
      const unchanged = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
          user: { select: { name: true, email: true } },
        },
      });
      return res.json(formatOrder(unchanged));
    }

    const order = await prisma.order.update({
      where: { id },
      data: { orderStatus: status },
      include: {
        orderItems: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const notifyUserId = await resolveNotifyUserId(order);
    if (notifyUserId) {
      try {
        await createOrderStatusNotification(notifyUserId, order.id, status);
      } catch (err) {
        console.error('Failed to create in-app notification:', err);
      }
    }

    const targetEmail = order.customerEmail || order.user?.email;
    if (targetEmail) {
      sendOrderStatusUpdateEmail(order, targetEmail).catch((err) => {
        console.error('Failed to send status update email:', err);
      });
    }

    res.json(formatOrder(order));
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error updating order status.' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus
};
