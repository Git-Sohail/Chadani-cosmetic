/**
 * Normalizes order + line-item snapshots for admin/customer APIs.
 * Includes `products` alias and `category` on each line item.
 */
function formatOrderItem(item) {
  const subtotal =
    item.subtotal != null ? item.subtotal : Number((item.price * item.quantity).toFixed(2));

  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    productDescription: item.productDescription || '',
    productImage: item.productImage || null,
    category: item.productCategory || 'General',
    productCategory: item.productCategory || 'General',
    sku: item.sku || '',
    price: item.price,
    quantity: item.quantity,
    subtotal,
  };
}

function formatOrder(order) {
  const items = (order.orderItems || []).map(formatOrderItem);
  const productsSubtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const deliveryFee = 100; // Dharan local delivery is flat NPR 100

  // Authoritative total: Products Subtotal + Rs. 100 Dharan Delivery.
  // If stored order.totalAmount only equalled productsSubtotal (or was less than subtotal + deliveryFee),
  // ensure the flat delivery fee is properly included.
  const authoritativeTotal =
    order.totalAmount > productsSubtotal
      ? order.totalAmount
      : (productsSubtotal > 0 ? productsSubtotal + deliveryFee : order.totalAmount);

  return {
    id: order.id,
    orderId: order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail || order.user?.email || null,
    email: order.customerEmail || order.user?.email || null,
    phone: order.phone,
    address: order.address,
    deliveryAddress: order.address,
    city: order.city || 'Dharan',
    area: order.area || null,
    postalCode: order.postalCode || null,
    deliveryWard: order.deliveryWard || null,
    deliveryArea: order.deliveryArea || null,
    deliveryLandmark: order.deliveryLandmark || null,
    deliveryLat: order.deliveryLat || null,
    deliveryLng: order.deliveryLng || null,
    deliveryMapUrl: order.deliveryMapUrl || null,
    paymentMethod: order.paymentMethod,
    orderDate: order.createdAt,
    createdAt: order.createdAt,
    productsSubtotal,
    deliveryFee,
    totalAmount: authoritativeTotal,
    orderStatus: order.orderStatus,
    user: order.user,
    orderItems: items,
    products: items,
  };
}

function formatOrders(orders) {
  return orders.map(formatOrder);
}

module.exports = { formatOrder, formatOrders, formatOrderItem };
