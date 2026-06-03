export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_MESSAGES = {
  pending: 'Your order is awaiting confirmation from our team.',
  confirmed: 'Your order has been confirmed and is being prepared.',
  shipped: 'Your order has been shipped and is on the way to you.',
  delivered: 'Your order has been delivered. Thank you for shopping with us!',
  cancelled: 'This order has been cancelled. Contact support if you need assistance.',
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}

export function getOrderStatusMessage(status) {
  return ORDER_STATUS_MESSAGES[status] || `Order status: ${status}`;
}

export function getOrderStatusStyles(status) {
  const map = {
    pending: 'bg-pink-50 text-pink-700 border-pink-100',
    confirmed: 'bg-amber-50 text-amber-700 border-amber-100',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };
  return map[status] || map.pending;
}

export const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export function getOrderStatusStepIndex(status) {
  if (status === 'cancelled') return -1;
  const idx = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}
