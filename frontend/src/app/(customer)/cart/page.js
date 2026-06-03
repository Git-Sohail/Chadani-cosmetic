'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

export default function CartPage() {
  const { cartItems, updateQuantity, deleteCartItem, cartSubtotal, cartTotal, loading } = useCart();
  const router = useRouter();

  const handleCheckoutClick = () => {
    router.push('/checkout');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-extrabold text-rose-950 mb-8 flex items-center gap-2.5">
          <ShoppingBag className="w-7 h-7 text-rose-600" />
          Your Shopping Cart
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-pink-100 shadow-sm text-rose-900/60 font-medium">
            <svg className="animate-spin h-8 w-8 text-rose-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading your beauty selection...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-[2rem] border border-pink-100/60 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-5 text-rose-600 text-2xl">
              🛍️
            </div>
            <h2 className="font-serif font-extrabold text-xl text-rose-950 mb-2">
              Your cart is feeling a bit light!
            </h2>
            <p className="text-sm text-rose-900/60 mb-8 max-w-sm">
              Discover our organic skincare remedies, traditional customer-favorite bangles, and sparkling jewelry collections to fill it up.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-200 flex-shrink-0 overflow-hidden border border-pink-100">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-rose-950 font-bold text-[10px] p-2 text-center">
                        {item.product.category?.name || 'Beauty'}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow text-center sm:text-left space-y-1">
                    <h3 className="font-serif font-black text-base text-rose-950 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">
                      {item.product.category?.name}
                    </p>
                    <p className="text-sm font-black text-rose-900 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-2xl p-1.5 shrink-0 shadow-inner">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-rose-900 hover:text-white text-rose-950 font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-sm text-rose-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-rose-900 hover:text-white text-rose-950 font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total Price */}
                  <div className="text-right font-black text-base text-rose-950 w-24 shrink-0 hidden sm:block">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => deleteCartItem(item.id)}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {/* Back to shopping link */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-900 hover:text-rose-950 transition-colors pt-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue shopping</span>
              </Link>
            </div>

            {/* Order Summary sidebar */}
            <div className="lg:col-span-4 bg-white border border-pink-100 rounded-[2rem] p-6 shadow-sm space-y-6">
              <h2 className="font-serif font-extrabold text-lg text-rose-950 pb-4 border-b border-pink-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-rose-950/70">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-rose-950/70">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                
                <div className="border-t border-pink-100 pt-4 flex justify-between text-rose-950 font-extrabold text-base">
                  <span>Total Amount</span>
                  <span className="text-rose-900">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Free delivery notice badge */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-emerald-800 leading-normal">
                  Congrats! Your order is eligible for **Free Standard Shipping** across NY and other states.
                </span>
              </div>

              {/* Checkout CTA */}
              <Button
                onClick={handleCheckoutClick}
                variant="primary"
                size="lg"
                fullWidth
                className="shadow-lg hover:shadow-xl hover:shadow-rose-900/10"
              >
                Checkout
                <ArrowRight className="w-4.5 h-4.5 ml-2" />
              </Button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
