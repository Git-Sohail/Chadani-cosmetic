'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/Button';
import OrderHistoryCard from '../../../components/orders/OrderHistoryCard';
import { FileSpreadsheet, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../../../context/NotificationContext';

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

function OrderHistoryContent() {
  const { user, token, API_URL, loading: authLoading } = useAuth();
  const { fetchNotifications } = useNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');
  const highlightedRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchOrders();
        fetchNotifications();
      }
    }
  }, [user, authLoading, router, fetchOrders, fetchNotifications]);

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

  useEffect(() => {
    const onHighlight = (event) => {
      const orderId = event.detail?.orderId;
      if (orderId) highlightOrderCard(orderId, setExpandedOrders);
    };
    window.addEventListener('orders:highlight', onHighlight);
    return () => window.removeEventListener('orders:highlight', onHighlight);
  }, []);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Syncing Profile...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-rose-900/70 hover:text-rose-900 mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        <div className="mb-8 pb-6 border-b border-pink-100">
          <span className="text-xs font-black text-rose-900 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-600" />
            Chadani Cosmetic Account
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-rose-950">My Orders</h1>
          <p className="text-sm text-rose-950/60 font-medium mt-2 max-w-xl">
            Each order is split into summary, delivery, and a separate{' '}
            <strong className="text-rose-900">products purchased</strong> section with checkout
            prices in Nepali Rupees (NPR).
          </p>
        </div>

        {previewImage && (
          <div
            className="fixed inset-0 z-[200] bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
            onKeyDown={() => {}}
            role="presentation"
          >
            <div
              className="relative max-w-2xl bg-white rounded-3xl overflow-hidden p-2 border border-pink-100 animate-zoomIn"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={() => {}}
              role="presentation"
            >
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-rose-950 hover:bg-rose-900 hover:text-white transition-all shadow-md"
              >
                ✕
              </button>
              <img
                src={previewImage}
                alt="Product preview"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 text-rose-900/40 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100 p-8">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-serif font-black text-red-950">{error}</h3>
            <Button onClick={fetchOrders} variant="primary" className="mt-6">
              Try Again
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-pink-100 shadow-sm p-10">
            <FileSpreadsheet className="w-12 h-12 text-rose-200 mx-auto mb-4" />
            <h3 className="font-serif font-black text-2xl text-rose-950">No orders yet</h3>
            <p className="text-sm text-rose-900/60 mt-3">Explore our collection and place your first order.</p>
            <Button onClick={() => router.push('/shop')} variant="primary" className="mt-8 px-10">
              Shop now
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${
                    statusFilter === key
                      ? 'bg-rose-900 text-white border-rose-900'
                      : 'bg-white text-rose-900/60 border-pink-100 hover:border-rose-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-center py-12 text-sm font-semibold text-rose-900/50">
                No orders with this status.
              </p>
            ) : (
              <div className="space-y-8">
                {filteredOrders.map((order) => (
                  <OrderHistoryCard
                    key={order.id}
                    order={order}
                    isExpanded={!!expandedOrders[order.id]}
                    isHighlighted={highlightOrderId === order.id}
                    onToggle={() => toggleExpand(order.id)}
                    onPreviewImage={setPreviewImage}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 text-rose-950/40">
          <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Loading orders...</span>
        </div>
      }
    >
      <OrderHistoryContent />
    </Suspense>
  );
}
