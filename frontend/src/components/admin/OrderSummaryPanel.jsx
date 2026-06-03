'use client';

import React from 'react';
import { Users, Mail, Phone, MapPin, Calendar, CreditCard, Package, IndianRupee } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

const statusStyles = {
  pending: 'bg-pink-50 text-pink-700 border-pink-100',
  confirmed: 'bg-amber-50 text-amber-700 border-amber-100',
  shipped: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
};

export default function OrderSummaryPanel({ order, statusControl = null }) {
  const statusClass = statusStyles[order.orderStatus] || statusStyles.pending;

  return (
    <div className="bg-white border border-pink-100/70 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-pink-50 pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-900/40 mb-1">Order ID</p>
          <p className="font-mono font-black text-rose-950 text-sm sm:text-base break-all">{order.id || order.orderId}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customer
          </h3>
          <dl className="space-y-2 text-sm font-bold text-rose-950/80">
            <div className="flex gap-2">
              <dt className="text-rose-900/40 w-20 shrink-0">Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-rose-900/40 w-20 shrink-0 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</dt>
              <dd className="break-all">{order.customerEmail || order.email || order.user?.email || 'N/A'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-rose-900/40 w-20 shrink-0 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-rose-900/40 w-20 shrink-0 flex items-start gap-1 pt-0.5"><MapPin className="w-3 h-3" /> Address</dt>
              <dd className="leading-relaxed font-medium">{order.address || order.deliveryAddress}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Order details
          </h3>
          <dl className="space-y-2 text-sm font-bold text-rose-950/80">
            <div className="flex gap-2 items-center">
              <Calendar className="w-3.5 h-3.5 text-rose-700" />
              <span>{new Date(order.createdAt || order.orderDate).toLocaleString()}</span>
            </div>
            <div className="flex gap-2 items-center">
              <CreditCard className="w-3.5 h-3.5 text-rose-700" />
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex gap-2 items-center pt-2">
              <IndianRupee className="w-4 h-4 text-rose-700" />
              <span className="text-lg font-black text-rose-950">{formatPrice(order.totalAmount)}</span>
            </div>
          </dl>
          {statusControl}
        </div>
      </div>
    </div>
  );
}
