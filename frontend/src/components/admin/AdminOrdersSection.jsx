'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ChevronDown, ChevronUp, Package } from 'lucide-react';
import OrderedProductsTable from './OrderedProductsTable';
import ImagePreviewModal from './ImagePreviewModal';
import { formatPrice } from '../../utils/currency';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
};

function StatusBadge({ status }) {
  const norm = (status || 'pending').toLowerCase();
  const style = STATUS_STYLES[norm] || STATUS_STYLES.pending;
  return (
    <span className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider border ${style}`}>
      {norm}
    </span>
  );
}

export default function AdminOrdersSection({ orders, onStatusChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [preview, setPreview] = useState({ url: null, alt: '' });
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const getItems = (order) => order.products || order.orderItems || [];

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 text-brand-muted text-xs uppercase tracking-widest border border-dashed border-brand-border bg-brand-surface">
        <Package className="w-8 h-8 mx-auto mb-2 text-brand-border" />
        No orders match the selected criteria
      </div>
    );
  }

  const handleSelectStatus = (orderId, currentStatus, newStatus) => {
    if (currentStatus === 'cancelled') {
      return alert('This order is cancelled and its inventory was restored. Cancelled orders cannot be modified.');
    }
    if (currentStatus === 'delivered' && newStatus !== 'delivered') {
      return alert('Delivered orders cannot be moved back to unfulfilled or cancelled states.');
    }
    setPendingStatusChange({ orderId, currentStatus, newStatus });
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange && onStatusChange) {
      onStatusChange(pendingStatusChange.orderId, pendingStatusChange.newStatus);
    }
    setPendingStatusChange(null);
  };

  return (
    <>
      <ImagePreviewModal
        imageUrl={preview.url}
        alt={preview.alt}
        onClose={() => setPreview({ url: null, alt: '' })}
      />

      {/* Confirmation Dialog */}
      {pendingStatusChange && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">Confirm Status Change</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to update order <strong>#{pendingStatusChange.orderId.slice(0, 8)}</strong> to{' '}
              <span className="uppercase font-mono font-bold text-brand-dark">
                {pendingStatusChange.newStatus}
              </span>?
              {pendingStatusChange.newStatus === 'cancelled' && (
                <span className="block text-red-700 font-medium mt-1">
                  Warning: Cancelling will atomically restore the order&apos;s product inventory and prevent future edits.
                </span>
              )}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="flex-1 px-4 py-2.5 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2.5 text-xs uppercase tracking-wider text-brand-surface cursor-pointer ${
                  pendingStatusChange.newStatus === 'cancelled'
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

      <div className="space-y-3">
        {orders.map((order) => {
          const isOpen = expandedId === order.id;
          const lineItems = getItems(order);
          const currentStatus = (order.orderStatus || 'pending').toLowerCase();
          const isCancelled = currentStatus === 'cancelled';
          const isDelivered = currentStatus === 'delivered';

          return (
            <article
              key={order.id}
              className="bg-brand-surface border border-brand-border transition-colors hover:border-brand-accent/60"
            >
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 min-w-0">
                  <div className="min-w-[100px]">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                      Order Ref
                    </span>
                    <p className="font-mono text-xs font-semibold text-brand-dark">
                      #{order.id.slice(0, 8)}…
                    </p>
                  </div>

                  <div className="min-w-[140px]">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                      Client
                    </span>
                    <p className="font-medium text-xs text-brand-dark truncate">{order.customerName}</p>
                    <p className="text-[11px] text-brand-muted font-mono">{order.phone}</p>
                  </div>

                  <div className="min-w-[90px]">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                      Placed On
                    </span>
                    <p className="text-xs text-brand-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="min-w-[90px]">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                      Total
                    </span>
                    <p className="font-mono text-xs font-medium text-brand-dark">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  <div>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="px-3 py-1.5 border border-brand-border text-[11px] uppercase tracking-wider text-brand-dark hover:border-brand-accent flex items-center gap-1 cursor-pointer"
                  >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isOpen ? 'Hide items' : `${lineItems.length} items`}</span>
                  </button>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="px-3 py-1.5 bg-brand-dark text-brand-surface text-[11px] uppercase tracking-wider hover:bg-brand-accent flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspection</span>
                  </Link>

                  {!isCancelled && !isDelivered && (
                    <select
                      value={currentStatus}
                      onChange={(e) => handleSelectStatus(order.id, currentStatus, e.target.value)}
                      aria-label={`Change status for order #${order.id.slice(0, 8)}`}
                      className="px-2.5 py-1.5 bg-brand-surface border border-brand-border text-[11px] uppercase tracking-wider font-medium text-brand-dark focus:outline-none focus:border-brand-accent cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-bg/30 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-brand-dark uppercase tracking-wider text-[11px]">
                      Line items snapshot:
                    </span>
                    <span className="text-brand-muted text-[11px]">
                      Flat Dharan Delivery (Rs. 100) included in total
                    </span>
                  </div>
                  <OrderedProductsTable
                    items={lineItems}
                    compact
                    onImagePreview={(url, alt) => setPreview({ url, alt })}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
