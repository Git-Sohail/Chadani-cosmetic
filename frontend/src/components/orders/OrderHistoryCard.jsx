'use client';

import React, { useState, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Calendar, Hash, MapPin, Phone,
  CreditCard, User, ShoppingBag, Image as ImageIcon, Package,
  Star, Loader2, CheckCircle, Pencil,
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
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          className="cursor-pointer" aria-label={`${s} star`}>
          <Star className={`w-6 h-6 transition-colors ${s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-rose-200 fill-rose-100'}`} />
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
      const res = await axios.get(`${API_URL}/reviews/product/${productId}/can-review`, { headers: authHeader });
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
    } catch { setStatus('idle'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, productId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/reviews/product/${productId}`,
        { rating, comment: comment.trim() || undefined }, { headers: authHeader });
      setExisting(res.data.review); setEditing(false); setStatus('done');
    } catch (err) { setError(err.response?.data?.error || 'Could not submit.'); }
    finally { setSubmitting(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const res = await axios.put(`${API_URL}/reviews/${existing.id}`,
        { rating, comment: comment.trim() || undefined }, { headers: authHeader });
      setExisting(res.data.review); setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Could not update.'); }
    finally { setSubmitting(false); }
  };

  if (!productId) return null;

  // Idle — show button
  if (status === 'idle') {
    return (
      <button type="button" onClick={checkEligibility}
        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-colors">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        Write a Review
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-rose-900/40">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  // Already reviewed — show summary + edit
  if (status === 'done' && !editing) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Your review</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= existing?.rating ? 'fill-amber-400 text-amber-400' : 'text-rose-200 fill-rose-100'}`} />
              ))}
            </div>
          </div>
          <button type="button"
            onClick={() => { setRating(existing?.rating ?? 5); setComment(existing?.comment ?? ''); setEditing(true); }}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        {existing?.comment && (
          <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">{existing.comment}</p>
        )}
      </div>
    );
  }

  // Form (new or edit)
  const isEdit = status === 'done' && editing;
  return (
    <form onSubmit={isEdit ? handleEditSubmit : handleSubmit}
      className="mt-3 p-4 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-rose-900/50">
        {isEdit ? 'Edit your review' : 'Rate this product'}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…" rows={2} maxLength={1000}
        className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-rose-950 disabled:opacity-50 transition-colors">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
          {isEdit ? 'Save changes' : 'Post Review'}
        </button>
        <button type="button" onClick={() => isEdit ? setEditing(false) : setStatus('idle')}
          className="px-5 py-2 rounded-xl border border-pink-100 text-[10px] font-black uppercase tracking-wider text-rose-900 hover:bg-pink-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function ProductThumb({ src, alt, onZoom }) {
  return (
    <button type="button" onClick={() => src && onZoom(src)}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-pink-100 overflow-hidden shrink-0 bg-white ${src ? 'cursor-zoom-in hover:ring-2 hover:ring-rose-300' : 'cursor-default'}`}>
      {src
        ? <img src={src} alt={alt} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center bg-pink-50"><ImageIcon className="w-5 h-5 text-pink-200" /></div>}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-pink-100/80">
      <div className="p-2 rounded-xl bg-rose-900 text-white shrink-0"><Icon className="w-4 h-4" /></div>
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-rose-950">{title}</h3>
        {subtitle && <p className="text-[10px] text-rose-900/50 font-semibold mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function OrderHistoryCard({ order, isExpanded, isHighlighted, onToggle, onPreviewImage }) {
  const items = order.orderItems || [];
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const previewItems = items.slice(0, 4);
  const extraCount = items.length - previewItems.length;
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <article id={`order-${order.id}`}
      className={`bg-white border rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300 scroll-mt-28 ${
        isHighlighted ? 'border-rose-500 ring-2 ring-rose-400/50 shadow-lg shadow-rose-200/40' : 'border-pink-100 hover:shadow-md'}`}>

      {/* Section 1: Summary */}
      <header className="p-5 sm:p-6 bg-gradient-to-r from-pink-50/80 to-white border-b border-pink-100/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3 flex-1 min-w-[200px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getOrderStatusStyles(order.orderStatus)}`}>
                {getOrderStatusLabel(order.orderStatus)}
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-900/50">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-rose-950/80">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                {new Date(order.createdAt).toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-sm font-semibold text-rose-900/75 leading-relaxed max-w-xl">{getOrderStatusMessage(order.orderStatus)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40 mb-1">Order total (NPR)</p>
            <p className="text-xl sm:text-2xl font-black text-rose-900">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>

        {!isExpanded && previewItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-pink-100/60">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40 mb-2">Products in this order</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {previewItems.map((item) => <ProductThumb key={item.id} src={item.productImage} alt={item.productName} onZoom={onPreviewImage} />)}
              {extraCount > 0 && <span className="text-[10px] font-black text-rose-800/60 px-2">+{extraCount}</span>}
            </div>
          </div>
        )}

        <button type="button" onClick={onToggle}
          className="mt-5 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-950 flex items-center justify-center gap-2 transition-colors">
          {isExpanded ? 'Hide order details' : 'View order details'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </header>

      {isExpanded && (
        <div className="animate-slideDown">
          {/* Section 2: Progress */}
          <section className="p-5 sm:p-6 border-b border-pink-50 bg-white">
            <SectionHeader icon={Package} title="Order progress" subtitle="Track where your package is in our fulfillment flow" />
            <div className="pt-2"><OrderStatusStepper status={order.orderStatus} /></div>
          </section>

          {/* Section 3: Delivery details */}
          <section className="p-5 sm:p-6 border-b border-pink-50 bg-pink-50/20">
            <SectionHeader icon={MapPin} title="Delivery details" subtitle="Shipping and payment information for this order" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="rounded-2xl bg-white border border-pink-100/80 p-4 space-y-2">
                <dt className="text-[9px] font-black uppercase tracking-widest text-rose-900/40 flex items-center gap-1"><User className="w-3 h-3" /> Recipient</dt>
                <dd className="font-black text-rose-950">{order.customerName}</dd>
                <dd className="text-rose-900/60 font-semibold flex items-center gap-1 text-xs"><Phone className="w-3.5 h-3.5" />{order.phone}</dd>
              </div>
              <div className="rounded-2xl bg-white border border-pink-100/80 p-4 space-y-2">
                <dt className="text-[9px] font-black uppercase tracking-widest text-rose-900/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery address</dt>
                <dd className="text-rose-950/80 font-medium leading-relaxed">{order.address}</dd>
                <dd className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1 pt-1"><CreditCard className="w-3.5 h-3.5" />{order.paymentMethod}</dd>
              </div>
            </dl>
          </section>

          {/* Section 4: Products purchased */}
          <section className="p-5 sm:p-6 bg-gradient-to-b from-rose-950/[0.03] to-pink-50/30 border-l-4 border-rose-600">
            <SectionHeader icon={ShoppingBag} title="Products purchased"
              subtitle={isDelivered ? 'Order delivered — rate each product below' : 'Items exactly as ordered — prices locked at checkout (NPR)'} />

            <div className="space-y-3 pt-2">
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-2xl border border-pink-100 shadow-sm hover:border-rose-200 transition-colors">
                  <div className="flex gap-4">
                    <ProductThumb src={item.productImage} alt={item.productName} onZoom={onPreviewImage} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-serif font-black text-rose-950 text-sm leading-snug">{item.productName}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-pink-50 border border-pink-100 text-rose-800 text-[8px] font-black uppercase tracking-wider rounded">
                            {item.productCategory || 'General'}
                          </span>
                        </div>
                        <p className="text-sm font-black text-rose-900 shrink-0">{formatPrice(item.subtotal ?? item.price * item.quantity)}</p>
                      </div>
                      {item.productDescription && (
                        <p className="text-[10px] text-rose-900/50 mt-2 line-clamp-2 font-medium">{item.productDescription}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-bold text-rose-900/60">
                        <span>Unit: <span className="text-rose-950">{formatPrice(item.price)}</span></span>
                        <span>Qty: <span className="text-rose-950">{item.quantity}</span></span>
                        {item.sku && <span className="font-mono">SKU: <span className="text-rose-950">{item.sku}</span></span>}
                      </div>
                    </div>
                  </div>
                  {/* Review — only for delivered orders */}
                  {isDelivered && <ProductReviewInline item={item} />}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-pink-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-900/50 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />Full order ID: <span className="font-mono text-rose-950">{order.id}</span>
              </span>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-900/40">Grand total</p>
                <p className="text-lg font-black text-rose-900">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
