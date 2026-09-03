'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import {
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Loader2,
  Navigation,
  ExternalLink,
  Map,
  X,
  AlertTriangle,
  Banknote,
  Receipt,
} from 'lucide-react';
import axios from 'axios';
import { formatPrice, getProductPricing, DHARAN_DELIVERY_FEE } from '../../../utils/currency';

// Dharan bounding box coordinates
const DHARAN_BOUNDS = { minLat: 26.78, maxLat: 26.85, minLng: 87.25, maxLng: 87.32 };

const DHARAN_AREAS = [
  'Bhanu Chowk',
  'Putali Line',
  'Chatara Line',
  'Railway',
  'Bargachhi',
  'Pindeshwor',
  'Buddha Chowk',
  'College Road',
  'Purano Bazar',
  'Zero Point',
  'Chhata Chowk',
  'Yalambar Chowk',
  'Amarhat',
  'Bijayapur',
  'Panmara',
  'BPKIHS Area',
];

const WARDS = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);

function isInsideDharan(lat, lng) {
  return (
    lat >= DHARAN_BOUNDS.minLat &&
    lat <= DHARAN_BOUNDS.maxLat &&
    lng >= DHARAN_BOUNDS.minLng &&
    lng <= DHARAN_BOUNDS.maxLng
  );
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
    <div className="fixed inset-0 z-[200] bg-brand-dark/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border shadow-2xl w-full max-w-lg space-y-4 p-6 rounded">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <h3 className="font-serif text-lg text-brand-dark font-medium">Pin Your Location in Dharan</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-brand-muted hover:text-brand-dark cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close location picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-brand-muted leading-relaxed">
          Verify or adjust your coordinates in Dharan. This assists our courier in reaching your exact doorstep.
        </p>

        {/* Map Preview */}
        <div className="overflow-hidden border border-brand-border h-48 bg-brand-bg">
          <iframe
            title="Dharan OpenStreetMap Preview"
            width="100%"
            height="100%"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${pinLng - 0.005},${pinLat - 0.003},${pinLng + 0.005},${pinLat + 0.003}&layer=mapnik&marker=${pinLat},${pinLng}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
              Latitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={pinLat}
              onChange={(e) => setPinLat(parseFloat(e.target.value) || pinLat)}
              className="w-full px-3 py-2 border border-brand-border bg-brand-surface rounded text-xs font-mono focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
              Longitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={pinLng}
              onChange={(e) => setPinLng(parseFloat(e.target.value) || pinLng)}
              className="w-full px-3 py-2 border border-brand-border bg-brand-surface rounded text-xs font-mono focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={handleConfirm} className="min-h-[44px]">
            Confirm Coordinates
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } = useCart();
  const { user, token, API_URL, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/checkout');
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    deliveryWard: '',
    deliveryArea: '',
    address: '',
    deliveryLandmark: '',
    paymentMethod: 'Cash on Delivery',
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
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => applyGpsCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => setGpsStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [applyGpsCoords]);

  const handleManualPin = useCallback(
    (coords) => {
      applyGpsCoords(coords.lat, coords.lng);
    },
    [applyGpsCoords]
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double-submission

    setError('');
    if (!formData.customerName.trim()) return setError('Please enter your full name.');
    if (!formData.phone.trim()) return setError('Please enter your active contact phone number.');
    if (!formData.deliveryWard) return setError('Please select your Dharan ward number.');
    if (!formData.address.trim()) return setError('Please enter your detailed delivery address.');

    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: 'Dharan',
        area: formData.deliveryArea || null,
        deliveryWard: formData.deliveryWard,
        deliveryArea: formData.deliveryArea || null,
        deliveryLandmark: formData.deliveryLandmark?.trim() || null,
        paymentMethod: 'Cash on Delivery',
        ...(gps && { deliveryLat: gps.lat, deliveryLng: gps.lng, deliveryMapUrl: gps.mapUrl }),
      };

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlacedOrderDetails(res.data);
      setOrderPlaced(true);
      await clearCart();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Unable to place order. Please review your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Order Success Screen (Receipt View) ───────────────────────────────────
  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="bg-brand-bg min-h-screen py-12 sm:py-20 px-4">
        <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
          {/* Header Icon */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 border border-brand-border bg-brand-surface mx-auto flex items-center justify-center text-brand-dark">
              <CheckCircle2 className="w-7 h-7 text-brand-accent" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark font-normal tracking-tight">
              Thank You for Your Order
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
              Your order has been recorded. Our team will pack and dispatch your selection directly to your doorstep in Dharan.
            </p>
          </div>

          {/* Structured Confirmation Receipt Card */}
          <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-accent" />
                <span className="font-serif text-base text-brand-dark font-medium">Order Receipt</span>
              </div>
              <span className="text-xs font-mono text-brand-muted">
                #{placedOrderDetails.id?.slice(0, 8)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Recipient</span>
                <span className="font-medium text-brand-dark">{placedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Contact Phone</span>
                <span className="font-medium text-brand-dark">{placedOrderDetails.phone}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Delivery Method</span>
                <span className="font-medium text-brand-dark">Dharan Local Delivery (Flat Rs. 100)</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Payment</span>
                <span className="font-medium text-brand-dark">Cash on Delivery</span>
              </div>

              <div className="pt-2 border-t border-brand-border/60">
                <span className="text-[11px] uppercase tracking-wider text-brand-muted block mb-1">
                  Delivery Destination
                </span>
                <p className="text-brand-dark leading-relaxed">
                  {[
                    placedOrderDetails.deliveryWard,
                    placedOrderDetails.deliveryArea,
                    placedOrderDetails.address,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  , Dharan
                </p>
                {placedOrderDetails.deliveryLandmark && (
                  <p className="text-brand-muted text-[11px] mt-0.5">
                    Landmark: {placedOrderDetails.deliveryLandmark}
                  </p>
                )}
              </div>

              {placedOrderDetails.deliveryMapUrl && (
                <div className="pt-2">
                  <a
                    href={placedOrderDetails.deliveryMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-accent hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View pin location on Google Maps</span>
                  </a>
                </div>
              )}

              {/* Total Row */}
              <div className="pt-4 border-t border-brand-border/60 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-brand-dark">Total Amount Due</span>
                <span className="font-serif text-2xl font-semibold text-brand-dark">
                  {formatPrice(placedOrderDetails.totalAmount)}
                </span>
              </div>
            </div>

            {/* Next Step Information */}
            <div className="border border-brand-border bg-brand-bg p-3.5 text-xs text-brand-muted leading-relaxed">
              <strong>What to expect next:</strong> You will receive an email confirmation shortly. Our courier will contact your phone prior to arrival. Please have the cash total ready upon delivery.
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href={`/account/orders?orderId=${placedOrder.id}`} className="flex-1">
              <Button variant="secondary" size="md" fullWidth className="min-h-[44px]">
                View Order Details
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button variant="primary" size="md" fullWidth className="min-h-[44px]">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Auth Loading ──────────────────────────────────────────────────────────
  if (authLoading || (!user && !orderPlaced)) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center gap-3 text-brand-muted">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      {showManualPin && (
        <ManualPinModal
          onClose={() => setShowManualPin(false)}
          onConfirm={handleManualPin}
          initial={gps}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation / Header */}
        <div className="border-b border-brand-border/70 pb-6 mb-8 sm:mb-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-dark transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
                Final Step
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark font-normal tracking-tight">
                Order Checkout
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-brand-muted bg-brand-surface border border-brand-border px-3.5 py-1.5 self-start sm:self-end">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" />
              <span>Dharan Delivery &bull; Flat Rs. 100 &bull; Cash on Delivery</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface border border-brand-border p-8 max-w-md mx-auto">
            <h2 className="font-serif text-xl text-brand-dark mb-2">No items in your bag</h2>
            <p className="text-xs text-brand-muted mb-6 leading-relaxed">
              Your bag is currently empty. Browse our collection to add items before checking out.
            </p>
            <Button onClick={() => router.push('/shop')} variant="primary" size="md">
              Browse Catalogue
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ── Left Column: Delivery & Payment Details ── */}
            <div className="lg:col-span-7 bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-xl text-brand-dark pb-4 border-b border-brand-border/60">
                Delivery Details
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="customerName"
                      className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                    >
                      <User className="w-3 h-3 text-brand-accent" /> Full Name *
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Receiver name"
                      required
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-brand-accent" /> Contact Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98XXXXXXXX"
                      required
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                {/* Ward & Area Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="deliveryWard"
                      className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                    >
                      Dharan Ward Number *
                    </label>
                    <select
                      id="deliveryWard"
                      name="deliveryWard"
                      value={formData.deliveryWard}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer min-h-[44px]"
                    >
                      <option value="">Select Ward</option>
                      {WARDS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="deliveryArea"
                      className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                    >
                      Area / Tole
                    </label>
                    <select
                      id="deliveryArea"
                      name="deliveryArea"
                      value={formData.deliveryArea}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer min-h-[44px]"
                    >
                      <option value="">Select Area in Dharan</option>
                      {DHARAN_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detailed Street Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="address"
                    className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-brand-accent" /> Doorstep Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    required
                    placeholder="House number, road name, or neighborhood..."
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent resize-none"
                  />
                </div>

                {/* Nearest Landmark */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="deliveryLandmark"
                    className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                  >
                    Nearest Landmark <span className="normal-case text-brand-muted/70">(Optional)</span>
                  </label>
                  <input
                    id="deliveryLandmark"
                    type="text"
                    name="deliveryLandmark"
                    value={formData.deliveryLandmark}
                    onChange={handleInputChange}
                    placeholder="e.g. Near BPKIHS Gate 1, Opposite Buddha Chowk"
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                  />
                </div>

                {/* Location Pin Assistance Section */}
                <div className="border border-brand-border bg-brand-bg p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-brand-dark flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Precise Location Pin (Optional)</span>
                    </h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Provides GPS coordinates to our rider for seamless doorstep navigation.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gpsStatus === 'loading' || gpsStatus === 'captured'}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-dark text-brand-surface text-[11px] uppercase tracking-wider font-medium hover:bg-brand-accent disabled:opacity-50 transition-colors cursor-pointer min-h-[44px]"
                    >
                      {gpsStatus === 'loading' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : gpsStatus === 'captured' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                          <span>Coordinates Saved</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Detect My Location</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowManualPin(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-brand-border bg-brand-surface text-brand-dark text-[11px] uppercase tracking-wider font-medium hover:border-brand-accent transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Adjust Pin</span>
                    </button>

                    {gps && (
                      <button
                        type="button"
                        onClick={() => {
                          setGps(null);
                          setGpsStatus('idle');
                          setOutsideDharan(false);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-2 text-brand-muted hover:text-red-700 text-xs transition-colors cursor-pointer min-h-[44px]"
                        aria-label="Clear GPS pin"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {outsideDharan && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p>
                        Your pin appears outside Dharan. We currently dispatch only within Dharan. Please verify your address.
                      </p>
                    </div>
                  )}

                  {gpsStatus === 'captured' && gps && !outsideDharan && (
                    <div className="bg-brand-surface border border-brand-border p-3 space-y-2 text-xs">
                      <p className="text-emerald-800 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Location pinned within Dharan
                      </p>
                      <div className="h-28 border border-brand-border overflow-hidden">
                        <iframe
                          title="Pinned location preview"
                          width="100%"
                          height="100%"
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${gps.lng - 0.004},${gps.lat - 0.003},${gps.lng + 0.004},${gps.lat + 0.003}&layer=mapnik&marker=${gps.lat},${gps.lng}`}
                        />
                      </div>
                    </div>
                  )}

                  {gpsStatus === 'denied' && (
                    <p className="text-xs text-brand-muted italic">
                      Browser location permission was not granted. You may proceed normally with your written address.
                    </p>
                  )}
                </div>

                {/* Payment Method Presentation */}
                <div className="pt-3 border-t border-brand-border/60 space-y-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-brand-accent" /> Payment Option
                  </span>
                  <div className="border border-brand-dark bg-brand-bg p-4 flex items-start gap-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked
                      readOnly
                      className="mt-1 accent-brand-dark cursor-default"
                    />
                    <label htmlFor="cod" className="cursor-pointer">
                      <span className="font-serif text-sm text-brand-dark font-medium block">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-brand-muted block mt-0.5 leading-relaxed">
                        Pay in cash upon inspection when our courier delivers the package to your doorstep in Dharan.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Primary Place Order CTA */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                    loading={loading}
                    className="py-4 tracking-[0.18em] uppercase text-xs min-h-[48px]"
                  >
                    {loading ? (
                      <span>Recording Order...</span>
                    ) : (
                      <span>Place Order &bull; {formatPrice(cartTotal)}</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-5 bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6 sticky top-[calc(var(--nav-height-desktop)+1.5rem)]">
              <h2 className="font-serif text-xl text-brand-dark pb-4 border-b border-brand-border/60">
                Order Review
              </h2>

              {/* Items List */}
              <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3.5 divide-y divide-brand-border/40">
                {cartItems.map((item) => {
                  const pricing = getProductPricing(item.product);
                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-14 aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-brand-muted/40 italic text-[10px]">
                            {item.product.category?.name || 'Item'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs text-brand-dark line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] text-brand-muted font-mono block">
                          Qty: {item.quantity} &times; {formatPrice(pricing.activePrice)}
                        </span>
                      </div>

                      <span className="text-xs font-medium text-brand-dark shrink-0">
                        {formatPrice(pricing.activePrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-brand-border/60 pt-4 text-xs space-y-3">
                <div className="flex justify-between text-brand-muted">
                  <span>Products Subtotal</span>
                  <span className="font-medium text-brand-dark">{formatPrice(cartSubtotal)}</span>
                </div>

                <div className="flex justify-between text-brand-muted">
                  <div className="space-y-0.5">
                    <span className="block text-brand-dark font-medium">Dharan Delivery</span>
                    <span className="text-[10px] text-brand-muted block">Doorstep flat rate</span>
                  </div>
                  <span className="font-medium text-brand-dark">{formatPrice(deliveryFee || DHARAN_DELIVERY_FEE)}</span>
                </div>

                <div className="border-t border-brand-border/60 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-semibold text-brand-dark block">Final Total Due</span>
                    <span className="text-[10px] text-brand-muted">Payable in cash on arrival</span>
                  </div>
                  <span className="font-serif text-2xl font-semibold text-brand-dark">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Policy Note */}
              <div className="border border-brand-border bg-brand-bg p-3 text-[11px] text-brand-muted leading-relaxed">
                By placing this order, you confirm doorstep delivery in Dharan, Nepal with Cash on Delivery payment.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
