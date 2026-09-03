'use client';

import React from 'react';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '../../utils/currency';

const STATUS_BADGES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
};

export default function OrderSummaryPanel({ order, statusControl = null }) {
  const currentStatus = (order.orderStatus || 'pending').toLowerCase();
  const badgeClass = STATUS_BADGES[currentStatus] || STATUS_BADGES.pending;

  const hasGps = order.deliveryLat && order.deliveryLng;
  const mapUrl =
    order.deliveryMapUrl ||
    (hasGps ? `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}` : null);

  const lineItems = order.products || order.orderItems || [];
  const calculatedItemsSubtotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.subtotal ?? item.price * item.quantity) || 0),
    0
  );
  const deliveryFee = order.deliveryFee ?? 100;
  const grandTotal = order.totalAmount;

  return (
    <div className="bg-brand-surface border border-brand-border p-5 sm:p-7 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-muted block">
            Order Reference
          </span>
          <p className="font-mono text-sm sm:text-base font-semibold text-brand-dark">
            #{order.id}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-medium uppercase tracking-wider border ${badgeClass}`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-accent" />
            <span>Customer Details</span>
          </h3>
          <dl className="space-y-2 text-xs text-brand-text">
            <div className="flex gap-2">
              <dt className="text-brand-muted w-20 shrink-0">Name:</dt>
              <dd className="font-medium text-brand-dark">{order.customerName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-brand-muted w-20 shrink-0 flex items-center gap-1">
                <Mail className="w-3 h-3 text-brand-accent" />
                <span>Email:</span>
              </dt>
              <dd className="font-mono break-all">
                {order.customerEmail || order.email || order.user?.email || 'N/A'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-brand-muted w-20 shrink-0 flex items-center gap-1">
                <Phone className="w-3 h-3 text-brand-accent" />
                <span>Phone:</span>
              </dt>
              <dd className="font-mono">{order.phone}</dd>
            </div>
          </dl>
        </div>

        {/* Order Details & Summary Totals */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-brand-accent" />
            <span>Order & Payment Breakdown</span>
          </h3>
          <dl className="space-y-2 text-xs text-brand-text">
            <div className="flex gap-2 items-center">
              <dt className="text-brand-muted w-20 shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-accent" />
                <span>Date:</span>
              </dt>
              <dd>{new Date(order.createdAt || order.orderDate).toLocaleString()}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="text-brand-muted w-20 shrink-0 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-brand-accent" />
                <span>Payment:</span>
              </dt>
              <dd className="font-medium">{order.paymentMethod || 'Cash on Delivery'}</dd>
            </div>
            <div className="pt-2 border-t border-brand-border/60 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Products Subtotal:</span>
                <span className="font-mono text-brand-dark">{formatPrice(calculatedItemsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Flat Dharan Delivery:</span>
                <span className="font-mono text-brand-dark">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium pt-1 border-t border-brand-border/40">
                <span className="text-brand-dark">Grand Total:</span>
                <span className="font-mono text-sm text-brand-accent">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </dl>
          {statusControl}
        </div>
      </div>

      {/* Delivery Address — Dharan */}
      <div className="border-t border-brand-border pt-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-accent" />
          <span>Fulfillment Address — Dharan Delivery</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-brand-bg/50 p-3.5 border border-brand-border/60 space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
              Ward & Area
            </span>
            <p className="font-medium text-brand-dark">{order.deliveryWard || order.city || 'Dharan'}</p>
            <p className="text-brand-muted">{order.deliveryArea || order.area || '—'}</p>
          </div>
          <div className="bg-brand-bg/50 p-3.5 border border-brand-border/60 space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
              Address & Landmark
            </span>
            <p className="text-brand-dark leading-relaxed">{order.address || order.deliveryAddress || '—'}</p>
            {(order.deliveryLandmark || order.postalCode) && (
              <p className="text-[11px] text-brand-accent">
                📍 Landmark: {order.deliveryLandmark || order.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* GPS location */}
        {hasGps ? (
          <div className="bg-brand-surface border border-brand-border p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                Customer Delivery GPS Coordinates
              </span>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-dark underline hover:text-brand-accent"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              title="Delivery Location Coordinates"
              width="100%"
              height="160"
              loading="lazy"
              className="border border-brand-border"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(order.deliveryLng) - 0.005},${Number(order.deliveryLat) - 0.003},${Number(order.deliveryLng) + 0.005},${Number(order.deliveryLat) + 0.003}&layer=mapnik&marker=${order.deliveryLat},${order.deliveryLng}`}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
