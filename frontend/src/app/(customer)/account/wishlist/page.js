'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '../../../../context/WishlistContext';
import { useCart } from '../../../../context/CartContext';
import { useToast } from '../../../../components/Toast';
import { Heart, ShoppingBag, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { formatPrice, getProductPricing } from '../../../../utils/currency';

export default function AccountWishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = async (item) => {
    if (!item.product) return;
    await addToCart(item.product, 1);
    toast(`"${item.product.name}" added to your shopping bag`, 'success');
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    toast('Item removed from wishlist', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
              Curated Collection
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
              My Wishlist
            </h1>
          </div>
          <span className="text-xs text-brand-muted font-mono">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'saved item' : 'saved items'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-xl leading-relaxed">
          Your saved cosmetics, skincare remedies, and traditional accessories for future shopping in Dharan.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 text-brand-muted gap-2 bg-brand-surface border border-brand-border">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">Loading wishlist...</span>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border p-12 text-center space-y-4">
          <Heart className="w-10 h-10 text-brand-muted/40 mx-auto" />
          <h2 className="font-serif text-xl text-brand-dark">Your wishlist is empty</h2>
          <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
            Save your favorite beauty and traditional items while browsing our collections.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            const pricing = getProductPricing(product);

            return (
              <div
                key={product.id}
                className="bg-brand-surface border border-brand-border p-4 flex flex-col justify-between group hover:border-brand-accent transition-colors"
              >
                <div>
                  {/* Portrait Thumbnail */}
                  <Link
                    href={`/shop/${product.id}`}
                    className="relative block aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden mb-3.5"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xs text-brand-muted/40 italic p-3 text-center">
                        {product.category?.name || 'Product'}
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-brand-accent block">
                      {product.category?.name || 'Cosmetics'}
                    </span>
                    <Link
                      href={`/shop/${product.id}`}
                      className="font-serif text-sm sm:text-base text-brand-dark hover:text-brand-accent transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
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
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-brand-border/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    disabled={product.stock <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-40 transition-colors cursor-pointer min-h-[44px]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="p-2.5 border border-brand-border bg-brand-surface text-brand-muted hover:text-red-700 hover:border-red-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
