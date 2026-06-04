'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import {
  CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Sparkles,
  MapPin, Phone, User, Loader2, Navigation, ExternalLink, Map,
} from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../../utils/currency';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, API_URL, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/checkout');
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    postalCode: '',
    paymentMethod: 'Cash on Delivery',
  });

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // GPS location state
  const [gps, setGps] = useState(null); // { lat, lng, mapUrl }
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | captured | denied | error

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGps({ lat, lng, mapUrl });
        setGpsStatus('captured');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          setGpsStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) return setError('Please enter your full name.');
    if (!formData.phone.trim()) return setError('Please enter your phone number.');
    if (!formData.address.trim()) return setError('Please enter your delivery address.');
    if (!formData.city.trim()) return setError('Please enter your city.');

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...(gps && {
          deliveryLat: gps.lat,
          deliveryLng: gps.lng,
          deliveryMapUrl: gps.mapUrl,
        }),
      };

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlacedOrderDetails(res.data);
      setOrderPlaced(true);
      await clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8 animate-fadeIn">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-xl shadow-emerald-100 animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-rose-400 animate-pulse" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-rose-950">Order Confirmed!</h1>
          <p className="text-sm sm:text-lg text-rose-900/60 max-w-md mx-auto font-medium">
            We&apos;ve received your order and our team is already preparing your beauty treats.
          </p>
        </div>
        <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 text-left max-w-md mx-auto space-y-4 shadow-xl shadow-pink-100/20">
          <h3 className="font-serif font-black text-xl text-rose-950 pb-3 border-b border-pink-50">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Reference</span><span className="font-mono font-black text-rose-950 bg-pink-50 px-3 py-1 rounded-lg">{placedOrderDetails.id}</span></div>
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Total</span><span className="font-black text-xl text-rose-900">{formatPrice(placedOrderDetails.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Recipient</span><span className="font-bold text-rose-950">{placedOrderDetails.customerName}</span></div>
            <div className="pt-2 border-t border-pink-50">
              <span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest block mb-1">Delivery Address</span>
              <span className="text-rose-950/70 font-medium leading-relaxed italic">
                {placedOrderDetails.address}{placedOrderDetails.city ? `, ${placedOrderDetails.city}` : ''}
              </span>
            </div>
            {placedOrderDetails.deliveryMapUrl && (
              <a href={placedOrderDetails.deliveryMapUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-black text-rose-700 hover:text-rose-950 transition-colors">
                <Map className="w-4 h-4" /> View delivery location on Google Maps
              </a>
            )}
          </div>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => router.push('/shop')} variant="primary" size="lg" className="px-10 py-4 rounded-2xl">Back to Shopping</Button>
          <Button onClick={() => router.push('/')} variant="outline" size="lg" className="px-10 py-4 rounded-2xl border-pink-200">Return Home</Button>
        </div>
      </div>
    );
  }

  if (authLoading || (!user && !orderPlaced)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-900/70 hover:text-rose-900 mb-8 transition-colors group cursor-pointer">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to cart
      </button>

      <h1 className="text-3xl font-serif font-extrabold text-rose-950 mb-8">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-pink-100 max-w-md mx-auto">
          <h2 className="font-serif font-extrabold text-lg text-rose-950 mb-2">No items to checkout</h2>
          <p className="text-sm text-rose-900/60 mb-6">Your shopping cart is empty.</p>
          <Button onClick={() => router.push('/shop')} variant="primary">Shop Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Delivery Form ── */}
          <div className="lg:col-span-7 bg-white border border-pink-100 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-8">

            {/* Delivery address section */}
            <div>
              <h2 className="text-xl font-serif font-extrabold text-rose-950 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" /> Delivery Information
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4 py-3 rounded-2xl mb-6">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-600" /> Full Name *
                    </label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange}
                      placeholder="Your full name" required
                      className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-600" /> Phone Number *
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="+977 98XXXXXXXX" required
                      className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> Full Delivery Address *
                  </label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange}
                    rows={2} required placeholder="Street, house/apartment number, landmark..."
                    className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10 resize-none" />
                </div>

                {/* Row 2: City + Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                      placeholder="e.g. Kathmandu" required
                      className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">Area / Province</label>
                    <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                      placeholder="e.g. Bagmati Province"
                      className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">Postal Code / Landmark (optional)</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                    placeholder="e.g. 44600 or Near XYZ Hospital"
                    className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
                </div>

                {/* GPS Location section */}
                <div className="rounded-2xl border border-pink-100 bg-pink-50/30 p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-black text-rose-950">Use My Current Location</p>
                      <p className="text-[11px] text-rose-900/50 font-medium">Optional — helps us deliver to your exact location</p>
                    </div>
                    <button type="button" onClick={handleGetLocation} disabled={gpsStatus === 'loading' || gpsStatus === 'captured'}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-900 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-950 disabled:opacity-50 transition-colors">
                      {gpsStatus === 'loading'
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
                        : gpsStatus === 'captured'
                        ? <><CheckCircle2 className="w-4 h-4" /> Captured</>
                        : <><Navigation className="w-4 h-4" /> Detect Location</>}
                    </button>
                  </div>

                  {gpsStatus === 'captured' && gps && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 space-y-2">
                      <p className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Location captured successfully
                      </p>
                      <a href={gps.mapUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-950 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                      </a>
                      <p className="text-[10px] text-rose-900/30 font-mono">
                        {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {gpsStatus === 'denied' && (
                    <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                      Location permission denied. You can still continue with your manual address.
                    </p>
                  )}

                  {gpsStatus === 'error' && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      Could not get location. Please continue with manual address.
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="pt-2 border-t border-pink-100/60 space-y-3">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" /> Payment Method
                  </label>
                  <div className="border-2 border-rose-900 rounded-2xl p-4 bg-pink-50/30 flex items-start gap-3">
                    <input type="radio" id="cod" name="paymentMethod" value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'} readOnly className="mt-1 accent-rose-900" />
                    <label htmlFor="cod" className="cursor-pointer">
                      <span className="block font-bold text-sm text-rose-950">Cash on Delivery</span>
                      <span className="block text-xs text-rose-900/60 mt-0.5 leading-relaxed">
                        Pay with cash when the package arrives at your doorstep.
                      </span>
                    </label>
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}
                  className="shadow-lg hover:shadow-xl py-4 rounded-2xl">
                  Place Order ({formatPrice(cartTotal)})
                </Button>
              </form>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-5 bg-pink-50/30 border border-pink-100 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
            <h2 className="font-serif font-extrabold text-lg text-rose-950 pb-4 border-b border-pink-100/60 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" /> Review Your Order
            </h2>
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 shrink-0 overflow-hidden border border-pink-100">
                      {item.product.image
                        ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-rose-950 p-1 text-center">{item.product.category?.name || 'Item'}</div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-rose-950 line-clamp-1 max-w-[180px]">{item.product.name}</h4>
                      <span className="text-[10px] text-rose-900/50 font-bold uppercase">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-950">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-pink-100/60 pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-rose-950/70"><span>Shipping</span><span className="text-emerald-600 font-bold">FREE</span></div>
              <div className="border-t border-pink-100/60 pt-3 flex justify-between text-rose-950 font-extrabold text-sm">
                <span>Total Amount</span>
                <span className="text-rose-900 text-lg font-black">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
