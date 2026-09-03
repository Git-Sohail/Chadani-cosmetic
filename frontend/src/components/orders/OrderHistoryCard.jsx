'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Hash,
  MapPin,
  Phone,
  Banknote,
  User,
  ShoppingBag,
  Star,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '../../utils/currency';
import { getOrderStatusLabel, getOrderStatusMessage, getOrderStatusStyles } from '../../utils/orderStatus';
import OrderStatusStepper from './OrderStatusStepper';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// ── Star picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer p-1"
          aria-label={`${s} star`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-brand-border fill-brand-bg'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Inline review form per product ────────────────────────────────────────────
function ProductReviewInline({ item }) {
  const { token, API_URL } = useAuth();
  const authHeader = { Authorization: `Bearer ${token}` };
  const productId = item.productId;

  const [status, setStatus] = useState('idle'); // idle|loading|form|done
  const [existing, setExisting] = useState(null);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const checkEligibility = useCallback(async () => {
    if (!productId) return;
    setStatus('loading');
    try {
      const res = await axios.get(`${API_URL}/reviews/product/${productId}/can-review`, {
        headers: authHeader,
      });
      if (res.data.canReview) {
        setStatus('form');
      } else if (res.data.reason === 'already_reviewed') {
        setExisting(res.data.existing);
        setRating(res.data.existing?.rating ?? 5);
        setComment(res.data.existing?.comment ?? '');
        setStatus('done');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, productId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/reviews/product/${productId}`,
        { rating, comment: comment.trim() || undefined },
        { headers: authHeader }
      );
      setExisting(res.data.review);
      setEditing(false);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.put(
        `${API_URL}/reviews/${existing.id}`,
        { rating, comment: comment.trim() || undefined },
        { headers: authHeader }
      );
      setExisting(res.data.review);
      setEditing(false);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={checkEligibility}
        className="mt-2 text-xs text-brand-accent hover:underline font-medium flex items-center gap-1 cursor-pointer"
      >
        <Star className="w-3.5 h-3.5" /> Rate & Review this product
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <div className="mt-2 text-xs text-brand-muted flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking eligibility...
      </div>
    );
  }

  if (status === 'done' && !editing) {
    return (
      <div className="mt-2 p-3 bg-brand-bg border border-brand-border text-xs space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-brand-dark">Your Review</span>
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < existing?.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-border'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] text-brand-accent hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>
        {existing?.comment && <p className="text-brand-muted italic">&ldquo;{existing.comment}&rdquo;</p>}
      </div>
    );
  }

  const isEdit = status === 'done' && editing;
  return (
    <form
      onSubmit={isEdit ? handleEditSubmit : handleSubmit}
      className="mt-3 p-4 bg-brand-bg border border-brand-border space-y-3"
    >
      <p className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">
        {isEdit ? 'Edit Your Review' : 'Rate This Item'}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here (optional)..."
        rows={2}
        maxLength={1000}
        className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded text-xs text-brand-text resize-none focus:outline-none focus:border-brand-accent"
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-brand-surface text-xs uppercase tracking-wider font-medium hover:bg-brand-accent disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
          <span>{isEdit ? 'Save Changes' : 'Post Review'}</span>
        </button>
        <button
          type="button"
          onClick={() => (isEdit ? setEditing(false) : setStatus('idle'))}
          className="px-4 py-2 border border-brand-border bg-brand-surface text-brand-dark text-xs uppercase tracking-wider font-medium hover:border-brand-accent transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main Order Card ───────────────────────────────────────────────────────────
export default function OrderHistoryCard({
  order,
  isExpanded,
  isHighlighted,
  onToggle,
  onPreviewImage,
  onCancelOrder,
}) {
  const items = order.orderItems || order.products || [];
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const previewItems = items.slice(0, 4);
  const extraCount = items.length - previewItems.length;
  const isDelivered = order.orderStatus?.toLowerCase() === 'delivered';
  const isPending = order.orderStatus?.toLowerCase() === 'pending';
  const [cancelling, setCancelling] = useState(false);

  // Derive products subtotal from snapshot prices
  const productsSubtotal = items.reduce(
    (sum, i) => sum + (Number(i.subtotal ?? i.price * i.quantity) || 0),
    0
  );
  const deliveryFee = 100; // Flat Dharan Delivery
  const authoritativeTotal =
    order.totalAmount > productsSubtotal
      ? Number(order.totalAmount)
      : (productsSubtotal > 0 ? productsSubtotal + deliveryFee : Number(order.totalAmount));

  const handleCancelClick = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel this pending order? This will release the reserved inventory.'
      )
    ) {
      return;
    }
    setCancelling(true);
    if (onCancelOrder) {
      await onCancelOrder(order.id);
    }
    setCancelling(false);
  };

  return (
    <article
      id={`order-${order.id}`}
      className={`bg-brand-surface border overflow-hidden transition-all duration-300 scroll-mt-28 ${
        isHighlighted
          ? 'border-brand-accent ring-1 ring-brand-accent shadow-md'
          : 'border-brand-border hover:border-brand-border/90'
      }`}
    >
      {/* ── Order Header Summary ── */}
      <header className="p-5 sm:p-6 border-b border-brand-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${getOrderStatusStyles(
                  order.orderStatus
                )}`}
              >
                {getOrderStatusLabel(order.orderStatus)}
              </span>
              <span className="text-xs font-mono font-medium text-brand-muted">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                {new Date(order.createdAt).toLocaleDateString('en-NP', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-brand-accent" />
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed max-w-xl">
              {getOrderStatusMessage(order.orderStatus)}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted block">
              Total Order Due
            </span>
            <p className="font-serif text-xl sm:text-2xl font-semibold text-brand-dark">
              {formatPrice(authoritativeTotal)}
            </p>
            <span className="text-[10px] text-brand-muted block">
              Includes Rs. {deliveryFee} Dharan Delivery
            </span>
          </div>
        </div>

        {/* Thumbnail preview row when collapsed */}
        {!isExpanded && previewItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-brand-border/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {previewItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.productImage && onPreviewImage && onPreviewImage(item.productImage)}
                  className={`relative w-12 h-14 bg-brand-bg border border-brand-border overflow-hidden shrink-0 ${
                    item.productImage ? 'cursor-zoom-in' : 'cursor-default'
                  }`}
                  title={item.productName}
                >
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-[9px] text-brand-muted/40 italic">
                      Item
                    </div>
                  )}
                </button>
              ))}
              {extraCount > 0 && (
                <span className="text-xs font-mono text-brand-muted px-1.5">+{extraCount} more</span>
              )}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider text-brand-dark hover:text-brand-accent transition-colors cursor-pointer min-h-[44px] shrink-0"
            >
              <span>View Details</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-brand-border/50 flex justify-end">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
            >
              <span>Hide Details</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* ── Expanded Order Details Drawer ── */}
      {isExpanded && (
        <div className="divide-y divide-brand-border/60 bg-brand-bg/30 animate-fadeIn">
          {/* Status Progression Stepper */}
          <div className="p-5 sm:p-6 bg-brand-surface">
            <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-4">
              Dispatch Progression
            </h3>
            <OrderStatusStepper status={order.orderStatus} />
          </div>

          {/* Delivery & Recipient Details */}
          <div className="p-5 sm:p-6 bg-brand-surface grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-brand-border bg-brand-bg p-4 space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-accent" /> Recipient Details
              </span>
              <p className="font-serif text-sm text-brand-dark font-medium">{order.customerName}</p>
              <p className="text-xs text-brand-muted flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{order.phone}</span>
              </p>
            </div>

            <div className="border border-brand-border bg-brand-bg p-4 space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-accent" /> Dharan Destination
              </span>
              <p className="text-xs text-brand-dark leading-relaxed">
                {[order.deliveryWard, order.deliveryArea, order.address].filter(Boolean).join(', ')}
                , Dharan
              </p>
              {order.deliveryLandmark && (
                <p className="text-[11px] text-brand-muted">Landmark: {order.deliveryLandmark}</p>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-muted font-mono pt-1 block">
                <Banknote className="w-3.5 h-3.5 text-brand-accent" />
                <span>{order.paymentMethod || 'Cash on Delivery'}</span>
              </span>
            </div>
          </div>

          {/* Purchased Line Items Snapshot */}
          <div className="p-5 sm:p-6 bg-brand-surface space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
              Purchased Line Items
            </h3>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-brand-border bg-brand-bg/50 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-3.5 min-w-0">
                    <div className="relative w-14 aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-[10px] text-brand-muted/50 italic">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <p className="font-serif text-sm text-brand-dark font-medium truncate">
                        {item.productName}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-brand-accent block">
                        {item.productCategory || 'Cosmetics'}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-brand-muted pt-0.5">
                        <span>Price: {formatPrice(item.price)}</span>
                        <span>&bull;</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {/* Product Review form if delivered */}
                      {isDelivered && <ProductReviewInline item={item} />}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                    <span className="font-medium text-sm text-brand-dark block">
                      {formatPrice(item.subtotal ?? item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary Breakdown */}
            <div className="border-t border-brand-border/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Products Subtotal</span>
                <span className="font-medium text-brand-dark">{formatPrice(productsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Dharan Doorstep Delivery</span>
                <span className="font-medium text-brand-dark">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="border-t border-brand-border/60 pt-2.5 flex justify-between items-baseline font-serif text-base text-brand-dark">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-dark">
                  Grand Total
                </span>
                <span className="text-xl font-semibold">{formatPrice(authoritativeTotal)}</span>
              </div>
            </div>

            {/* Pending Order Cancellation Action */}
            {isPending && (
              <div className="pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 border border-amber-200/60 p-4">
                <div className="text-xs text-amber-900">
                  <p className="font-semibold">Order is currently pending</p>
                  <p className="text-amber-800/80 text-[11px]">
                    You may cancel this order before dispatch to release reserved stock.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-800 text-white text-xs font-medium uppercase tracking-wider hover:bg-red-900 disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
                >
                  {cancelling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel Order</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
