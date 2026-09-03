'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { useCart } from '../../../context/CartContext';
import { ShoppingBag, ArrowLeft, ArrowRight, MapPin, Trash2 } from 'lucide-react';
import { formatPrice, getProductPricing } from '../../../utils/currency';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    deleteCartItem,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    loading,
  } = useCart();
  const router = useRouter();

  const handleCheckoutClick = () => {
    router.push('/checkout');
  };

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Editorial Header */}
        <div className="border-b border-brand-border/70 pb-6 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
                Your Selection
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark font-normal tracking-tight">
                Shopping Bag
              </h1>
            </div>
            {cartItems.length > 0 && (
              <span className="text-xs text-brand-muted uppercase tracking-wider font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-brand-surface border border-brand-border text-brand-muted space-y-3">
            <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase">Loading your bag...</span>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Bag Presentation */
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-brand-surface border border-brand-border text-center max-w-lg mx-auto">
            <div className="w-12 h-12 border border-brand-border bg-brand-bg flex items-center justify-center mb-4 text-brand-muted">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl text-brand-dark mb-2">Your Bag is Empty</h2>
            <p className="text-xs sm:text-sm text-brand-muted mb-8 max-w-sm leading-relaxed">
              Explore our curated skincare treatments, everyday beauty essentials, and artisan traditional jewelry to add items to your shopping bag.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="md" className="tracking-widest uppercase text-xs px-8">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                <span>Explore Collection</span>
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart Layout: 2-Column Responsive */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-brand-surface border border-brand-border divide-y divide-brand-border/60">
                {cartItems.map((item) => {
                  const pricing = getProductPricing(item.product);
                  const isLowStock = item.product.stock > 0 && item.product.stock < 5;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                    >
                      {/* Thumbnail Frame */}
                      <Link
                        href={`/shop/${item.product.id}`}
                        className="relative w-20 sm:w-24 aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden shrink-0 group"
                      >
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="96px"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-brand-muted/40 italic text-xs p-2 text-center">
                            {item.product.category?.name || 'Product'}
                          </div>
                        )}
                      </Link>

                      {/* Product Details & Pricing */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-accent block">
                          {item.product.category?.name || 'Cosmetics'}
                        </span>
                        <Link
                          href={`/shop/${item.product.id}`}
                          className="font-serif text-base sm:text-lg text-brand-dark hover:text-brand-accent transition-colors block line-clamp-1"
                        >
                          {item.product.name}
                        </Link>

                        {/* Unit Price */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs sm:text-sm font-medium text-brand-dark">
                            {formatPrice(pricing.activePrice)}
                          </span>
                          {pricing.oldPrice && (
                            <span className="text-xs text-brand-muted/60 line-through">
                              {formatPrice(pricing.oldPrice)}
                            </span>
                          )}
                        </div>

                        {/* Stock status */}
                        {isLowStock && (
                          <p className="text-[10px] text-amber-800 font-medium pt-0.5">
                            Only {item.product.stock} available in stock
                          </p>
                        )}
                      </div>

                      {/* Stepper Quantity Controls & Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-brand-border bg-brand-bg rounded">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-surface disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[36px]"
                            aria-label="Decrease quantity"
                          >
                            &minus;
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-brand-dark font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-surface disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[36px]"
                            aria-label="Increase quantity"
                          >
                            &#43;
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right sm:w-28 shrink-0">
                          <span className="font-medium text-sm sm:text-base text-brand-dark block">
                            {formatPrice(pricing.activePrice * item.quantity)}
                          </span>
                        </div>

                        {/* Secondary Remove Button */}
                        <button
                          type="button"
                          onClick={() => deleteCartItem(item.id)}
                          className="p-2 text-brand-muted hover:text-red-700 transition-colors cursor-pointer min-h-[44px] min-w-[36px] flex items-center justify-center"
                          aria-label={`Remove ${item.product.name} from bag`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Exploring Catalogue</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Delivery Calculation */}
            <div className="lg:col-span-4 bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6 sticky top-[calc(var(--nav-height-desktop)+1.5rem)]">
              <h2 className="font-serif text-xl text-brand-dark pb-4 border-b border-brand-border/60">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-brand-muted">
                  <span>Products Subtotal</span>
                  <span className="font-medium text-brand-dark">{formatPrice(cartSubtotal)}</span>
                </div>

                {/* Flat Dharan Delivery */}
                <div className="flex justify-between text-brand-muted">
                  <div className="space-y-0.5">
                    <span className="block text-brand-dark font-medium">Dharan Delivery</span>
                    <span className="text-[10px] text-brand-muted block">Doorstep flat rate</span>
                  </div>
                  <span className="font-medium text-brand-dark">{formatPrice(deliveryFee)}</span>
                </div>

                {/* Final Total */}
                <div className="border-t border-brand-border/60 pt-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-semibold text-brand-dark block">Estimated Total</span>
                    <span className="text-[10px] text-brand-muted">Inclusive of flat delivery</span>
                  </div>
                  <span className="font-serif text-2xl font-semibold text-brand-dark">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Factual Delivery Note (Requirement 1 & 4) */}
              <div className="border border-brand-border bg-brand-bg p-3.5 space-y-1 text-xs text-brand-muted">
                <div className="flex items-center gap-1.5 text-brand-dark font-medium text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span>Local Delivery Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Delivery is currently available within Dharan for a flat NPR 100 fee. Cash on Delivery is collected upon arrival.
                </p>
              </div>

              {/* Checkout Action Button */}
              <Button
                onClick={handleCheckoutClick}
                variant="primary"
                size="lg"
                fullWidth
                className="py-4 tracking-[0.18em] uppercase text-xs min-h-[48px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
