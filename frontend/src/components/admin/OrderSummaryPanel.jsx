'use client';

import React from 'react';
import { Users, Mail, Phone, MapPin, Calendar, CreditCard, Package, IndianRupee, ExternalLink } from 'lucide-react';
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
  const hasGps = order.deliveryLat && order.deliveryLng;
  const mapUrl = order.deliveryMapUrl || (hasGps ? `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}` : null);

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
        {/* Customer info */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 flex items-center gap-2">
            <Users className="w-4 h-4" /> Customer
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
          </dl>
        </div>

        {/* Order details */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 flex items-center gap-2">
            <Package className="w-4 h-4" /> Order details
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

      {/* Delivery address section */}
      <div className="border-t border-pink-50 pt-5 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Delivery Address — Dharan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-pink-50/40 rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Ward & Area</p>
            <p className="font-black text-rose-950">{order.deliveryWard || order.city || '—'}</p>
            <p className="font-bold text-rose-950/70 text-xs">{order.deliveryArea || order.area || '—'}</p>
          </div>
          <div className="bg-pink-50/40 rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Detailed Address</p>
            <p className="font-medium text-rose-950 leading-relaxed">{order.address || order.deliveryAddress || '—'}</p>
            {(order.deliveryLandmark || order.postalCode) && (
              <p className="text-[10px] text-rose-900/50 font-semibold">
                📍 {order.deliveryLandmark || order.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* GPS section */}
        {hasGps ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">GPS Location Available</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open Delivery Location
              </a>
              <span className="text-[10px] text-rose-900/40 font-mono">
                {Number(order.deliveryLat).toFixed(5)}, {Number(order.deliveryLng).toFixed(5)}
              </span>
            </div>
            <iframe
              title="Delivery Location"
              width="100%"
              height="180"
              loading="lazy"
              className="rounded-xl border border-emerald-100"
              src={`https://maps.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}&z=16&output=embed`}
            />
          </div>
        ) : (
          <p className="text-xs text-rose-900/40 font-semibold italic">No GPS location — use manual address for delivery.</p>
        )}
      </div>
    </div>
  );
}
