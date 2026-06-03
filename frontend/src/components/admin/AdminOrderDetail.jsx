'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft,
  Loader2,
  Check,
  Truck,
  Ban,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OrderSummaryPanel from './OrderSummaryPanel';
import OrderedProductsTable from './OrderedProductsTable';
import ImagePreviewModal from './ImagePreviewModal';
import { formatPrice } from '../../utils/currency';

const STATUS_ACTIONS = [
  { status: 'confirmed', label: 'Confirm Order', icon: Check, className: 'bg-amber-600 hover:bg-amber-700' },
  { status: 'shipped', label: 'Mark as Shipped', icon: Truck, className: 'bg-cyan-600 hover:bg-cyan-700' },
  { status: 'delivered', label: 'Mark as Delivered', icon: Package, className: 'bg-emerald-600 hover:bg-emerald-700' },
  { status: 'cancelled', label: 'Cancel Order', icon: Ban, className: 'bg-red-600 hover:bg-red-700' },
];

export default function AdminOrderDetail({ orderId }) {
  const { token, API_URL } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState({ url: null, alt: '' });

  const loadOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const updateStatus = async (status) => {
    if (!confirm(`Update order status to "${status}"?`)) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setToast(`Status updated to ${status}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 text-rose-900/40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Loading order...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-600 font-bold text-sm">{error || 'Order not found.'}</p>
        <Link href="/admin/orders" className="text-rose-900 font-black text-xs uppercase tracking-widest underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const lineItems = order.products || order.orderItems || [];

  const statusControl = (
    <div className="space-y-3 pt-2">
      <select
        value={order.orderStatus}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={updating}
        className="w-full bg-white border border-pink-200 rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-2"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="flex flex-wrap gap-2">
        {STATUS_ACTIONS.map(({ status, label, icon: Icon, className }) => (
          <button
            key={status}
            type="button"
            disabled={updating || order.orderStatus === status}
            onClick={() => updateStatus(status)}
            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 disabled:opacity-40 ${className}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <ImagePreviewModal
        imageUrl={preview.url}
        alt={preview.alt}
        onClose={() => setPreview({ url: null, alt: '' })}
      />

      {toast && (
        <div className="fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold">
          {toast}
        </div>
      )}

      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-900/60 hover:text-rose-950"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <OrderSummaryPanel order={order} statusControl={statusControl} />

      <div className="bg-white border border-pink-100/70 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-50 pb-4">
          <h2 className="font-serif font-black text-xl text-rose-950">Ordered Products</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-900/40">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} · snapshot at purchase
          </span>
        </div>

        <OrderedProductsTable
          items={lineItems}
          onImagePreview={(url, alt) => setPreview({ url, alt })}
        />

        <div className="pt-4 border-t border-pink-100 flex justify-end">
          <span className="font-black text-rose-950 text-xl">
            Order total: {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
