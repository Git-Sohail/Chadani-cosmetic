'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ChevronDown, ChevronUp, Package } from 'lucide-react';
import OrderSummaryPanel from './OrderSummaryPanel';
import OrderedProductsTable from './OrderedProductsTable';
import ImagePreviewModal from './ImagePreviewModal';
import { formatPrice } from '../../utils/currency';

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-pink-50 text-pink-700 border-pink-100',
    confirmed: 'bg-amber-50 text-amber-700 border-amber-100',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersSection({ orders, onStatusChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [preview, setPreview] = useState({ url: null, alt: '' });

  const items = (order) => order.products || order.orderItems || [];

  if (!orders.length) {
    return (
      <div className="text-center py-20 text-rose-900/40 text-xs font-black uppercase tracking-widest border-2 border-dashed border-pink-100 rounded-[2rem]">
        <Package className="w-10 h-10 mx-auto mb-3 text-pink-200" />
        No orders yet
      </div>
    );
  }

  return (
    <>
      <ImagePreviewModal
        imageUrl={preview.url}
        alt={preview.alt}
        onClose={() => setPreview({ url: null, alt: '' })}
      />

      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen = expandedId === order.id;
          const lineItems = items(order);

          return (
            <article
              key={order.id}
              className="bg-white border border-pink-100/70 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-pink-50/80">
                <div className="flex flex-wrap items-center gap-4 min-w-0">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Order ID</p>
                    <p className="font-mono font-black text-sm text-rose-950">#{order.id.slice(0, 8)}…</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Customer</p>
                    <p className="font-extrabold text-sm text-rose-950">{order.customerName}</p>
                    <p className="text-[10px] text-rose-900/50 font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Date</p>
                    <p className="text-xs font-bold text-rose-950/70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Total</p>
                    <p className="font-black text-rose-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="px-4 py-2.5 rounded-xl border border-pink-100 text-[10px] font-black uppercase tracking-widest text-rose-950 hover:bg-pink-50 flex items-center gap-1.5"
                  >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isOpen ? 'Hide items' : `View ${lineItems.length} items`}
                  </button>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="px-4 py-2.5 rounded-xl bg-rose-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-950 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Full details
                  </Link>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="bg-white border border-pink-200 rounded-xl text-[9px] font-black uppercase tracking-widest px-3 py-2.5"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {!isOpen && lineItems.length > 0 && (
                <div className="px-5 py-3 flex gap-2 overflow-x-auto custom-scrollbar bg-pink-50/20">
                  {lineItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.productImage && setPreview({ url: item.productImage, alt: item.productName })}
                      className="flex items-center gap-2 shrink-0 bg-white border border-pink-100 rounded-xl px-2 py-1.5 hover:border-rose-300 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-pink-100 bg-pink-50 flex-shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-pink-100" />
                        )}
                      </div>
                      <div className="text-left max-w-[140px]">
                        <p className="text-[10px] font-bold text-rose-950 truncate">{item.productName}</p>
                        <p className="text-[9px] text-rose-900/50">×{item.quantity} · {formatPrice(item.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isOpen && (
                <div className="p-5 sm:p-6 space-y-6 bg-[#fffafb]/50">
                  <OrderSummaryPanel order={order} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-rose-900 mb-4">
                      Ordered products (checkout snapshot)
                    </h4>
                    <OrderedProductsTable
                      items={lineItems}
                      compact
                      onImagePreview={(url, alt) => setPreview({ url, alt })}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
