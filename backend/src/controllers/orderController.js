const prisma = require('../db');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email');
const { formatOrder, formatOrders } = require('../utils/orderFormatter');
const { getActivePrice, DHARAN_DELIVERY_FEE, calculateOrderTotal } = require('../utils/currency');
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
      let productsSubtotal = 0;

      // 1. Validate stock availability and calculate products subtotal
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`);
        }
        const activePrice = getActivePrice(item.product);
        productsSubtotal += activePrice * item.quantity;
      }

      // Authoritative calculation: Products Subtotal + Flat Dharan Delivery (NPR 100)
      const totalAmount = calculateOrderTotal(productsSubtotal);

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
        const activePrice = getActivePrice(item.product);
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

    // Notify admin in real-time via Socket.IO
    const { getIo } = require('../socket');
    const io = getIo();
    if (io) {
      io.to('admin_room').emit('new_order', {
        orderId: orderDetails.id,
        customerName: orderDetails.customerName,
        totalAmount: orderDetails.totalAmount,
        createdAt: orderDetails.createdAt,
      });
    }

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

    const currentStatus = (existing.orderStatus || '').toLowerCase();
    const newStatus = status.toLowerCase();

    // Prevent any changes to already cancelled orders
    if (currentStatus === 'cancelled') {
      return res.status(400).json({
        error: 'This order has already been cancelled and its inventory was restored. Cancelled orders cannot be modified.',
      });
    }

    // Prevent moving delivered orders backwards into unfulfilled/cancelled states
    if (currentStatus === 'delivered' && newStatus !== 'delivered') {
      return res.status(400).json({
        error: 'Delivered orders cannot be moved back to unfulfilled or cancelled statuses.',
      });
    }

    if (currentStatus === newStatus) {
      const unchanged = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
          user: { select: { name: true, email: true } },
        },
      });
      return res.json(formatOrder(unchanged));
    }

    let order;

    // If cancelling an uncancelled order, restore inventory atomically
    if (newStatus === 'cancelled') {
      order = await prisma.$transaction(async (tx) => {
        const fullOrder = await tx.order.findUnique({
          where: { id },
          include: { orderItems: true },
        });

        if (fullOrder && fullOrder.orderItems) {
          for (const item of fullOrder.orderItems) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        return tx.order.update({
          where: { id },
          data: { orderStatus: 'cancelled' },
          include: {
            orderItems: true,
            user: { select: { name: true, email: true } },
          },
        });
      });
    } else {
      order = await prisma.order.update({
        where: { id },
        data: { orderStatus: newStatus },
        include: {
          orderItems: true,
          user: { select: { name: true, email: true } },
        },
      });
    }

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

// In-memory store for new order count per admin session (resets when admin visits orders page)
// This is per-process — good enough for single-instance free tier
const newOrderCounts = new Map(); // socket room tracking is the primary mechanism

const getNewOrderCount = async (req, res) => {
  try {
    // Count orders placed in the last 24 hours that are still pending
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.order.count({
      where: { orderStatus: 'pending', createdAt: { gte: since } },
    });
    res.json({ count });
  } catch (error) {
    console.error('Get new order count error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const resetNewOrderCount = async (req, res) => {
  // No server state to reset — client handles its own badge
  res.json({ ok: true });
};

// Admin — permanently delete an order and its items
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, customerName: true, orderStatus: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Cascade delete handles orderItems automatically
    await prisma.order.delete({ where: { id } });

    console.info(`[order delete] admin deleted order=${id} (customer: ${order.customerName})`);

    res.json({
      message: `Order #${id.slice(0, 8)}… for "${order.customerName}" has been permanently deleted.`,
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Server error deleting order.' });
  }
};

// Customer — cancel pending order
const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const isAdminUser = req.user.role === 'admin';

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Resilient ownership check: matches by userId, customerEmail, or admin privileges
    const orderEmail = (order.customerEmail || '').toLowerCase().trim();
    const isOwner = (order.userId && order.userId === userId) || (orderEmail && orderEmail === userEmail);

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ error: 'Access denied. You can only cancel your own orders.' });
    }

    // Status check: Only pending orders can be cancelled
    if ((order.orderStatus || '').toLowerCase() !== 'pending') {
      return res.status(400).json({
        error: `Order cannot be cancelled because its status is "${order.orderStatus}". Only pending orders can be cancelled.`,
      });
    }

    // Atomic transaction: restore product inventory safely and set status to cancelled
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Safely restore product stock for each orderItem
      for (const item of order.orderItems) {
        if (item.productId) {
          try {
            const productExists = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true },
            });
            if (productExists) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: { increment: item.quantity || 1 },
                },
              });
            }
          } catch (stockErr) {
            console.warn(`[order cancel] Could not restore stock for productId=${item.productId}:`, stockErr.message);
          }
        }
      }

      // 2. Mark order status as cancelled
      return await tx.order.update({
        where: { id },
        data: { orderStatus: 'cancelled' },
        include: {
          orderItems: true,
          user: { select: { name: true, email: true } },
        },
      });
    });

    // Notify customer via email asynchronously
    const targetEmail = updatedOrder.customerEmail || updatedOrder.user?.email || userEmail;
    if (targetEmail) {
      sendOrderStatusUpdateEmail(updatedOrder, targetEmail).catch((err) => {
        console.error('Failed to send cancellation update email:', err);
      });
    }

    // Real-time notification to admin via Socket.IO
    try {
      const { getIo } = require('../socket');
      const io = getIo();
      if (io) {
        io.to('admin_room').emit('order_status_updated', {
          orderId: updatedOrder.id,
          orderStatus: 'cancelled',
        });
      }
    } catch (sockErr) {
      // Socket emission failure should never break order response
    }

    res.json(formatOrder(updatedOrder));
  } catch (error) {
    console.error('Customer cancel order error:', error);
    res.status(500).json({ error: error.message || 'Server error cancelling order.' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getNewOrderCount,
  resetNewOrderCount,
  deleteOrder,
  cancelMyOrder,
};
