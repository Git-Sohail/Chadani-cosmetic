'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';
import { formatPrice, getProductPricing } from '../utils/currency';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const toast = useToast();
  const wishlisted = isWishlisted(product.id);
  const pricing = getProductPricing(product);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      await removeFromWishlist(product.id);
      toast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(product);
      toast('Added to wishlist', 'success');
    }
  };

  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      await addToCart(product, 1);
      toast(`"${product.name}" added to cart`, 'success');
    }
  };

  return (
    <div className="group relative bg-brand-surface border border-brand-border/80 flex flex-col h-full transition-all duration-300 hover:border-brand-accent/70 shadow-2xs">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-bg">
        {/* Badges: Sale / Discount */}
        {(product.isSale || pricing.hasDiscount) && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-brand-dark text-brand-surface text-[10px] font-medium tracking-[0.16em] uppercase">
            {pricing.discountPercent ? `-${pricing.discountPercent}%` : 'Special'}
          </span>
        )}

        {/* Action icons (Wishlist & Quick Details) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-8 h-8 bg-brand-surface/90 border border-brand-border flex items-center justify-center text-brand-dark hover:text-brand-accent hover:border-brand-accent transition-colors cursor-pointer"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-brand-accent text-brand-accent' : ''}`} />
          </button>
          <Link
            href={`/shop/${product.id}`}
            className="w-8 h-8 bg-brand-surface/90 border border-brand-border flex items-center justify-center text-brand-dark hover:text-brand-accent hover:border-brand-accent transition-colors"
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Image Link */}
        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-brand-muted/40 italic text-sm">
              {product.category?.name || 'Product'}
            </div>
          )}
        </Link>

        {/* Desktop Quick Add To Cart Drawer */}
        <div className="hidden sm:block absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={handleCartClick}
            disabled={product.stock <= 0}
            className="w-full py-2 bg-brand-dark text-brand-surface text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-medium">
              {product.category?.name || 'Beauty'}
            </span>
            {product.stock <= 0 ? (
              <span className="text-[9px] font-medium uppercase tracking-wider text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5">
                Out of Stock
              </span>
            ) : product.stock < 5 ? (
              <span className="text-[9px] font-medium uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
                Only {product.stock} Left
              </span>
            ) : null}
          </div>

          <Link href={`/shop/${product.id}`} className="block group-hover:text-brand-accent transition-colors">
            <h3 className="font-serif text-base sm:text-lg text-brand-dark leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="pt-3 border-t border-brand-border/40 mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {pricing.oldPrice && (
              <span className="text-xs text-brand-muted/60 line-through">
                {formatPrice(pricing.oldPrice)}
              </span>
            )}
            <span className="text-base sm:text-lg font-medium text-brand-dark">
              {formatPrice(pricing.activePrice)}
            </span>
          </div>

          {/* Mobile-only visible direct Add to Bag button */}
          <div className="sm:hidden">
            <Button
              onClick={handleCartClick}
              disabled={product.stock <= 0}
              variant={product.stock <= 0 ? 'outline' : 'primary'}
              size="sm"
              className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider"
              aria-label={product.stock <= 0 ? 'Out of Stock' : `Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              <span>{product.stock <= 0 ? 'Empty' : 'Add'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
