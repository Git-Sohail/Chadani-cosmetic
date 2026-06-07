'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import {
  CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Sparkles,
  MapPin, Phone, User, Loader2, Navigation, ExternalLink, Map, X, AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../../utils/currency';

// Dharan bounding box (approx)
const DHARAN_BOUNDS = { minLat: 26.78, maxLat: 26.85, minLng: 87.25, maxLng: 87.32 };

const DHARAN_AREAS = [
  'Bhanu Chowk', 'Putali Line', 'Chatara Line', 'Railway', 'Bargachhi',
  'Pindeshwor', 'Buddha Chowk', 'College Road', 'Purano Bazar', 'Zero Point',
  'Chhata Chowk', 'Yalambar Chowk', 'Amarhat', 'Bijayapur', 'Panmara', 'BPKIHS Area',
];

const WARDS = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);

function isInsideDharan(lat, lng) {
  return lat >= DHARAN_BOUNDS.minLat && lat <= DHARAN_BOUNDS.maxLat &&
         lng >= DHARAN_BOUNDS.minLng && lng <= DHARAN_BOUNDS.maxLng;
}

// Manual pin modal using OpenStreetMap iframe + click tracking
function ManualPinModal({ onClose, onConfirm, initial }) {
  const [pinLat, setPinLat] = useState(initial?.lat || 26.812);
  const [pinLng, setPinLng] = useState(initial?.lng || 87.284);

  const handleConfirm = () => {
    onConfirm({ lat: pinLat, lng: pinLng });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-rose-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] border border-pink-100 shadow-2xl w-full max-w-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-black text-lg text-rose-950">Pin Your Location in Dharan</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-pink-50 text-rose-900/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-rose-900/60 font-medium">
          Adjust the latitude and longitude below to match your exact location in Dharan.
          Use <a href={`https://www.google.com/maps/@26.812,87.284,14z`} target="_blank" rel="noopener noreferrer" className="text-rose-700 underline">Google Maps</a> to find your coordinates.
        </p>

        {/* Map preview */}
        <div className="rounded-2xl overflow-hidden border border-pink-100 h-48">
          <iframe
            title="Dharan Map"
            width="100%"
            height="100%"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${pinLat},${pinLng}&z=16&output=embed`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-rose-900/40">Latitude</label>
            <input type="number" step="0.00001" value={pinLat}
              onChange={(e) => setPinLat(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 border border-pink-100 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-200" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-rose-900/40">Longitude</label>
            <input type="number" step="0.00001" value={pinLng}
              onChange={(e) => setPinLng(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 border border-pink-100 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-200" />
          </div>
        </div>

        <p className="text-[10px] text-rose-900/40 font-medium">
          Dharan center: 26.812, 87.284 — adjust from there to your exact spot.
        </p>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-pink-100 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-900 hover:bg-pink-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm}
            className="flex-1 py-3 bg-rose-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-rose-950 transition-colors">
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, API_URL, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/checkout');
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    customerName: '', phone: '', deliveryWard: '', deliveryArea: '',
    address: '', deliveryLandmark: '', paymentMethod: 'Cash on Delivery',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [outsideDharan, setOutsideDharan] = useState(false);
  const [showManualPin, setShowManualPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyGpsCoords = useCallback((lat, lng) => {
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    setGps({ lat, lng, mapUrl });
    setGpsStatus('captured');
    setOutsideDharan(!isInsideDharan(lat, lng));
  }, []);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => applyGpsCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => setGpsStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [applyGpsCoords]);

  const handleManualPin = useCallback((coords) => {
    applyGpsCoords(coords.lat, coords.lng);
  }, [applyGpsCoords]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.customerName.trim()) return setError('Please enter your full name.');
    if (!formData.phone.trim()) return setError('Please enter your phone number.');
    if (!formData.deliveryWard) return setError('Please select your ward number.');
    if (!formData.address.trim()) return setError('Please enter your detailed address.');

    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        city: 'Dharan',
        area: formData.deliveryArea,
        deliveryWard: formData.deliveryWard,
        deliveryArea: formData.deliveryArea,
        deliveryLandmark: formData.deliveryLandmark,
        paymentMethod: formData.paymentMethod,
        ...(gps && { deliveryLat: gps.lat, deliveryLng: gps.lng, deliveryMapUrl: gps.mapUrl }),
      };
      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlacedOrderDetails(res.data);
      setOrderPlaced(true);
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8 animate-fadeIn">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-xl animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-rose-400 animate-pulse" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-rose-950">Order Confirmed!</h1>
          <p className="text-sm text-rose-900/60 max-w-md mx-auto font-medium">
            We&apos;ve received your order. Our team will deliver to you in Dharan shortly.
          </p>
        </div>
        <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 text-left max-w-md mx-auto space-y-4 shadow-xl">
          <h3 className="font-serif font-black text-xl text-rose-950 pb-3 border-b border-pink-50">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Reference</span><span className="font-mono font-black bg-pink-50 px-3 py-1 rounded-lg">{placedOrderDetails.id}</span></div>
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Total</span><span className="font-black text-xl text-rose-900">{formatPrice(placedOrderDetails.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest">Recipient</span><span className="font-bold">{placedOrderDetails.customerName}</span></div>
            <div className="pt-2 border-t border-pink-50">
              <span className="text-rose-950/40 font-black uppercase text-[10px] tracking-widest block mb-1">Delivery</span>
              <span className="text-rose-950/70 font-medium leading-relaxed">
                {[placedOrderDetails.deliveryWard, placedOrderDetails.deliveryArea, placedOrderDetails.address].filter(Boolean).join(', ')}, Dharan
              </span>
            </div>
            {placedOrderDetails.deliveryMapUrl && (
              <a href={placedOrderDetails.deliveryMapUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-black text-rose-700 hover:text-rose-950">
                <Map className="w-4 h-4" /> View delivery location on Google Maps
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showManualPin && (
        <ManualPinModal
          onClose={() => setShowManualPin(false)}
          onConfirm={handleManualPin}
          initial={gps}
        />
      )}

      <button onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-900/70 hover:text-rose-900 mb-8 transition-colors group cursor-pointer">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to cart
      </button>

      <h1 className="text-3xl font-serif font-extrabold text-rose-950 mb-2">Checkout</h1>
      <p className="text-xs font-semibold text-rose-900/50 mb-8 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-rose-600" />
        We currently deliver <strong>inside Dharan</strong> only
      </p>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-pink-100 max-w-md mx-auto">
          <h2 className="font-serif font-extrabold text-lg text-rose-950 mb-2">No items to checkout</h2>
          <Button onClick={() => router.push('/shop')} variant="primary" className="mt-4">Shop Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Delivery Form ── */}
          <div className="lg:col-span-7 bg-white border border-pink-100 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <h2 className="text-xl font-serif font-extrabold text-rose-950 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" /> Delivery Information
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4 py-3 rounded-2xl mb-6">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Name + Phone */}
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

              {/* Ward + Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">Ward Number *</label>
                  <select name="deliveryWard" value={formData.deliveryWard} onChange={handleInputChange} required
                    className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10 cursor-pointer">
                    <option value="">Select Ward</option>
                    {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">Area / Tole</label>
                  <select name="deliveryArea" value={formData.deliveryArea} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10 cursor-pointer">
                    <option value="">Select Area</option>
                    {DHARAN_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              {/* Detailed address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" /> Detailed Address *
                </label>
                <textarea name="address" value={formData.address} onChange={handleInputChange}
                  rows={2} required placeholder="House number, street name, building..."
                  className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10 resize-none" />
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider">Nearest Landmark (optional)</label>
                <input type="text" name="deliveryLandmark" value={formData.deliveryLandmark} onChange={handleInputChange}
                  placeholder="e.g. Near BPKIHS Gate, Opposite Buddha Chowk..."
                  className="w-full px-4 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-pink-50/10" />
              </div>

              {/* Location section */}
              <div className="rounded-2xl border border-pink-100 bg-pink-50/30 p-5 space-y-4">
                <div>
                  <p className="text-sm font-black text-rose-950">Location Pin <span className="text-rose-900/40 font-semibold normal-case text-xs">(optional but recommended)</span></p>
                  <p className="text-[11px] text-rose-900/50 font-medium mt-0.5">Helps our rider find you faster</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleGetLocation}
                    disabled={gpsStatus === 'loading' || gpsStatus === 'captured'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-900 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-950 disabled:opacity-50 transition-colors">
                    {gpsStatus === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
                      : gpsStatus === 'captured' ? <><CheckCircle2 className="w-4 h-4" /> GPS Captured</>
                      : <><Navigation className="w-4 h-4" /> Use My Location</>}
                  </button>
                  <button type="button" onClick={() => setShowManualPin(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-pink-200 text-rose-900 text-xs font-black uppercase tracking-wider hover:bg-pink-50 transition-colors bg-white">
                    <Map className="w-4 h-4" /> Pin Manually
                  </button>
                  {gps && (
                    <button type="button" onClick={() => { setGps(null); setGpsStatus('idle'); setOutsideDharan(false); }}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-100 text-red-600 text-xs font-black uppercase tracking-wider hover:bg-red-50 transition-colors bg-white">
                      <X className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                {outsideDharan && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-800">
                      We currently deliver only inside Dharan. Please contact us before ordering.
                    </p>
                  </div>
                )}

                {gpsStatus === 'captured' && gps && !outsideDharan && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 space-y-2">
                    <p className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Location captured successfully
                    </p>
                    <a href={gps.mapUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-950">
                      <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                    </a>
                    <div className="rounded-xl overflow-hidden border border-emerald-100 h-32 mt-2">
                      <iframe title="Location preview" width="100%" height="100%" loading="lazy"
                        src={`https://maps.google.com/maps?q=${gps.lat},${gps.lng}&z=16&output=embed`} />
                    </div>
                    <p className="text-[10px] text-rose-900/30 font-mono">{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</p>
                  </div>
                )}

                {gpsStatus === 'denied' && (
                  <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                    Location permission denied. You can still checkout with your manual address.
                  </p>
                )}
                {gpsStatus === 'error' && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    Could not detect location. Please use Pin Manually or continue with address.
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="pt-2 border-t border-pink-100/60 space-y-3">
                <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-600" /> Payment Method
                </label>
                <div className="border-2 border-rose-900 rounded-2xl p-4 bg-pink-50/30 flex items-start gap-3">
                  <input type="radio" id="cod" name="paymentMethod" value="Cash on Delivery"
                    checked readOnly className="mt-1 accent-rose-900" />
                  <label htmlFor="cod">
                    <span className="block font-bold text-sm text-rose-950">Cash on Delivery</span>
                    <span className="block text-xs text-rose-900/60 mt-0.5">Pay with cash when the package arrives.</span>
                  </label>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}
                className="shadow-lg py-4 rounded-2xl">
                Place Order ({formatPrice(cartTotal)})
              </Button>
            </form>
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
                        : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-rose-950 p-1">{item.product.category?.name || 'Item'}</div>}
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
            <div className="border-t border-pink-100/60 pt-4 text-xs space-y-2">
              <div className="flex justify-between text-rose-950/70"><span>Shipping</span><span className="text-emerald-600 font-bold">FREE (Dharan)</span></div>
              <div className="border-t border-pink-100/60 pt-3 flex justify-between font-extrabold text-sm">
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
