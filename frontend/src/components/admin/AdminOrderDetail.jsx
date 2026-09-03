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
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OrderSummaryPanel from './OrderSummaryPanel';
import OrderedProductsTable from './OrderedProductsTable';
import ImagePreviewModal from './ImagePreviewModal';

const STATUS_ACTIONS = [
  { status: 'confirmed', label: 'Confirm Order', icon: Check },
  { status: 'shipped', label: 'Mark Shipped', icon: Truck },
  { status: 'delivered', label: 'Mark Delivered', icon: Package },
  { status: 'cancelled', label: 'Cancel Order', icon: Ban, destructive: true },
];

export default function AdminOrderDetail({ orderId }) {
  const { token, API_URL } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState({ url: null, alt: '' });
  const [confirmStatus, setConfirmStatus] = useState(null);

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

  const handleApplyStatus = async (status) => {
    setConfirmStatus(null);
    setUpdating(true);
    setError('');
    try {
      const res = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setToast(`Order status updated to ${status}.`);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 text-brand-muted gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Loading order details...
        </span>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <p className="text-red-700 font-medium text-xs bg-red-50 border border-red-200 p-3">
          {error}
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-brand-dark underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders List</span>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = (order.orderStatus || '').toLowerCase();
  const isCancelled = currentStatus === 'cancelled';
  const isDelivered = currentStatus === 'delivered';
  const lineItems = order.products || order.orderItems || [];

  const statusControl = (
    <div className="space-y-3 pt-3 border-t border-brand-border/60">
      <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium block">
        Status Management
      </span>

      {isCancelled ? (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
          This order has been cancelled and its inventory was restored. No further status changes are permitted.
        </div>
      ) : isDelivered ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>This order was successfully delivered and fulfilled.</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map(({ status, label, icon: Icon, destructive }) => {
            const isSelected = currentStatus === status;
            return (
              <button
                key={status}
                type="button"
                disabled={updating || isSelected}
                onClick={() => setConfirmStatus(status)}
                className={`px-3 py-2 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40 min-h-[36px] cursor-pointer border ${
                  isSelected
                    ? 'bg-brand-dark text-brand-surface border-brand-dark cursor-default'
                    : destructive
                      ? 'border-red-200 text-red-700 bg-red-50/60 hover:bg-red-100/80'
                      : 'border-brand-border bg-brand-surface text-brand-dark hover:border-brand-accent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <ImagePreviewModal
        imageUrl={preview.url}
        alt={preview.alt}
        onClose={() => setPreview({ url: null, alt: '' })}
      />

      {/* Confirmation Modal */}
      {confirmStatus && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">Confirm Status Change</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to update order <strong>#{order.id.slice(0, 8)}</strong> to{' '}
              <span className="uppercase font-mono font-bold text-brand-dark">{confirmStatus}</span>?
              {confirmStatus === 'cancelled' && (
                <span className="block text-red-700 font-medium mt-1">
                  Warning: Cancelling will atomically restore the order&apos;s product inventory and prevent future edits.
                </span>
              )}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStatus(null)}
                className="flex-1 px-4 py-2.5 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyStatus(confirmStatus)}
                className={`flex-1 px-4 py-2.5 text-xs uppercase tracking-wider text-brand-surface ${
                  confirmStatus === 'cancelled'
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-brand-dark hover:bg-brand-accent'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      )}

      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-brand-muted hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Summary Panel */}
      <OrderSummaryPanel order={order} statusControl={statusControl} />

      {/* Line Items Table */}
      <div className="bg-brand-surface border border-brand-border p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3">
          <h2 className="font-serif text-lg text-brand-dark">Purchased Line Items</h2>
          <span className="text-[10px] uppercase tracking-wider text-brand-muted">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} (price snapshot at checkout)
          </span>
        </div>

        <OrderedProductsTable
          items={lineItems}
          onImagePreview={(url, alt) => setPreview({ url, alt })}
        />
      </div>
    </div>
  );
}
