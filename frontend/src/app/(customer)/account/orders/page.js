'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import OrderHistoryCard from '../../../../components/orders/OrderHistoryCard';
import { Package, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../../../components/Toast';

const FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function highlightOrderCard(orderId, setExpandedOrders) {
  if (!orderId) return;
  setExpandedOrders((prev) => ({ ...prev, [orderId]: true }));
  requestAnimationFrame(() => {
    document.getElementById(`order-${orderId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  });
}

function AccountOrdersContent() {
  const { token, API_URL } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');
  const highlightedRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setError('Could not retrieve your order history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  useEffect(() => {
    if (!loading && highlightOrderId && orders.some((o) => o.id === highlightOrderId)) {
      if (highlightedRef.current !== highlightOrderId) {
        highlightedRef.current = highlightOrderId;
        highlightOrderCard(highlightOrderId, setExpandedOrders);
      }
    }
  }, [loading, highlightOrderId, orders]);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state with the returned cancelled order
      const updatedOrder = res.data?.order || res.data;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder, orderStatus: 'cancelled' } : o))
      );
      toast('Order has been successfully cancelled.', 'success');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      const msg = err.response?.data?.error || 'Failed to cancel order. Please try again.';
      toast(msg, 'error');
      throw err;
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus?.toLowerCase() === statusFilter);

  return (
    <div className="space-y-6">
      {/* Lightbox Zoom Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-brand-dark/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
          role="presentation"
        >
          <div
            className="relative max-w-lg bg-brand-surface p-2 border border-brand-border"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-brand-dark text-brand-surface hover:bg-brand-accent transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-xs uppercase"
              aria-label="Close preview"
            >
              &times;
            </button>
            <img
              src={previewImage}
              alt="Product item preview"
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
              Order History
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
              My Orders
            </h1>
          </div>
          <span className="text-xs text-brand-muted font-mono">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed in total
          </span>
        </div>
        <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-2xl leading-relaxed">
          Review dispatch status across Dharan, inspect historical line-item snapshots, or review received items.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {FILTERS.map(({ key, label }) => {
          const active = statusFilter === key;
          const count =
            key === 'all'
              ? orders.length
              : orders.filter((o) => o.orderStatus?.toLowerCase() === key).length;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors min-h-[44px] border cursor-pointer ${
                active
                  ? 'bg-brand-dark text-brand-surface border-brand-dark'
                  : 'bg-brand-surface text-brand-muted border-brand-border hover:text-brand-dark'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 text-brand-muted gap-2 bg-brand-surface border border-brand-border">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">Loading order history...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-brand-surface border border-red-200 text-red-800 space-y-3">
          <p className="font-serif text-base">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2 bg-brand-dark text-brand-surface text-xs uppercase tracking-wider cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border p-12 text-center space-y-4">
          <Package className="w-10 h-10 text-brand-muted/40 mx-auto" />
          <h2 className="font-serif text-xl text-brand-dark">No orders found</h2>
          <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
            {statusFilter === 'all'
              ? 'You have not placed any orders yet. Discover our collection of traditional bangles and beauty products.'
              : `No orders currently match status "${statusFilter}".`}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              isExpanded={!!expandedOrders[order.id]}
              isHighlighted={highlightOrderId === order.id}
              onToggle={() => toggleExpand(order.id)}
              onPreviewImage={setPreviewImage}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">Loading orders...</span>
        </div>
      }
    >
      <AccountOrdersContent />
    </Suspense>
  );
}
