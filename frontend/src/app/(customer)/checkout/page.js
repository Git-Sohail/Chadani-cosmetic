'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Sparkles, MapPin, Phone, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../../utils/currency';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, API_URL, loading: authLoading } = useAuth();
  const router = useRouter();

  // Route Protection: must be logged in to checkout
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.customerName.trim()) return setError('Please enter your name.');
    if (!formData.phone.trim()) return setError('Please enter your phone number.');
    if (!formData.address.trim()) return setError('Please provide a delivery address.');

    setLoading(true);

    try {
      if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
        // Place real API order
        const res = await axios.post(`${API_URL}/orders`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlacedOrderDetails(res.data);
      } else {
        // Mock Place Order for local testing
        const mockOrder = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          totalAmount: cartTotal,
          paymentMethod: formData.paymentMethod,
          createdAt: new Date().toISOString()
        };
        setPlacedOrderDetails(mockOrder);
      }

      // Success
      setOrderPlaced(true);
      await clearCart(); // Clear local/server cart state
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please check stock levels and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success view block
  if (orderPlaced && placedOrderDetails) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8 animate-fadeIn">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-xl shadow-emerald-100 animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-rose-950">
              Order Confirmed!
            </h1>
            <p className="text-sm sm:text-lg text-rose-900/60 max-w-md mx-auto font-medium">
              We&apos;ve received your order and our team is already preparing your beauty treats with care.
            </p>
          </div>

          <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 text-left max-w-md mx-auto space-y-6 shadow-xl shadow-pink-100/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -translate-y-16 translate-x-16 opacity-50" />
            
            <h3 className="font-serif font-black text-xl text-rose-950 pb-4 border-b border-pink-50 flex items-center gap-2 relative z-10">
              <span className="text-rose-600">🔖</span>
              Summary
            </h3>
            
            <div className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-black text-rose-950/40 uppercase tracking-widest text-[10px]">Reference</span>
                <span className="font-mono font-black text-rose-950 bg-pink-50 px-3 py-1 rounded-lg">{placedOrderDetails.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-rose-950/40 uppercase tracking-widest text-[10px]">Total Paid</span>
                <span className="font-black text-xl text-rose-900">{formatPrice(placedOrderDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-rose-950/40 uppercase tracking-widest text-[10px]">Recipient</span>
                <span className="font-bold text-rose-950">{placedOrderDetails.customerName}</span>
              </div>
              <div className="flex flex-col pt-2 border-t border-pink-50">
                <span className="font-black text-rose-950/40 uppercase tracking-widest text-[10px] mb-1">Shipping Address</span>
                <span className="text-rose-950/70 font-medium leading-relaxed italic">{placedOrderDetails.address}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/shop')}
              variant="primary"
              size="lg"
              className="px-10 py-4.5 rounded-2xl shadow-xl shadow-rose-900/10"
            >
              Back to Shopping
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="px-10 py-4.5 rounded-2xl border-pink-200"
            >
              Return Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (authLoading || (!user && !orderPlaced)) {
    return (
      <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Checking checkout session...</span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-rose-900/70 hover:text-rose-900 mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to cart</span>
        </button>

        <h1 className="text-3xl font-serif font-extrabold text-rose-950 mb-8">
          Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-pink-100 max-w-md mx-auto">
            <h2 className="font-serif font-extrabold text-lg text-rose-950 mb-2">No items to checkout</h2>
            <p className="text-sm text-rose-900/60 mb-6">Your shopping cart is currently empty.</p>
            <Button onClick={() => router.push('/shop')} variant="primary">Shop Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Shipping Form Panel */}
            <div className="lg:col-span-7 bg-white border border-pink-100 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl font-serif font-extrabold text-rose-950 mb-6 flex items-center gap-2">
                <MapPin className="w-5.5 h-5.5 text-rose-600" />
                Delivery Information
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4 py-3 rounded-2xl mb-6">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label htmlFor="customerName" className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your first and last name"
                    className="w-full px-4.5 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-350 bg-pink-50/10 placeholder-rose-950/30"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 123-4567"
                    className="w-full px-4.5 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-350 bg-pink-50/10 placeholder-rose-950/30"
                    required
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Delivery Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3.5"
                    placeholder="Provide street address, apartment, city, state, zip code..."
                    className="w-full px-4.5 py-3 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-350 bg-pink-50/10 placeholder-rose-950/30 resize-none"
                    required
                  />
                </div>

                {/* Payment Method Details */}
                <div className="pt-4 border-t border-pink-100/60 space-y-4">
                  <label className="text-xs font-bold uppercase text-rose-950/70 tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                    Payment Method
                  </label>

                  <div className="border-2 border-rose-900 rounded-2xl p-4 bg-pink-50/30 flex items-start gap-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      readOnly
                      className="mt-1 accent-rose-900"
                    />
                    <label htmlFor="cod" className="cursor-pointer">
                      <span className="block font-bold text-sm text-rose-950">Cash on Delivery</span>
                      <span className="block text-xs text-rose-900/60 mt-0.5 leading-relaxed">
                        Pay with cash when the package is delivered to your doorstep. Safe, convenient, and secure.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    className="shadow-lg hover:shadow-xl hover:shadow-rose-900/10 py-3.5"
                  >
                    Place Order ({formatPrice(cartTotal)})
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side: Order Summary Preview */}
            <div className="lg:col-span-5 bg-pink-50/30 border border-pink-100 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
              <h2 className="font-serif font-extrabold text-lg text-rose-950 pb-4 border-b border-pink-100/60 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                Review Your Order
              </h2>

              {/* Items List */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex-shrink-0 overflow-hidden border border-pink-100">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-[8px] font-bold text-rose-950 p-1 text-center">
                            {item.product.category?.name || 'Item'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-rose-950 leading-snug line-clamp-1 max-w-[180px]">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] text-rose-900/50 font-bold uppercase">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-950">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="border-t border-pink-100/60 pt-4 space-y-3 text-xs">
                <div className="flex justify-between text-rose-950/70">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-rose-950/70 pb-1">
                  <span>Total Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span className="font-bold">{cartItems.length}</span>
                </div>
                
                <div className="border-t border-pink-100/60 pt-4 flex justify-between text-rose-950 font-extrabold text-sm sm:text-base">
                  <span>Total Amount</span>
                  <span className="text-rose-900 text-lg font-black">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
