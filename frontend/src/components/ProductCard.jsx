'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';
import { formatPrice } from '../utils/currency';

export default function ProductCard({
  product = {
    id: '1',
    name: 'Luxury Velvet Matte Lipstick',
    price: 24.99,
    oldPrice: 32.00,
    image: '',
    rating: 4.8,
    isFeatured: true,
    isSale: true,
    stock: 10,
    category: { name: 'Cosmetics' }
  }
}) {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const toast = useToast();

  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
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
    if (product.stock > 0) {
      await addToCart(product, 1);
      toast(`"${product.name}" added to cart`, 'success');
    }
  };

  return (
    <div className="group relative bg-white border border-pink-100/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-305 flex flex-col h-full">
      {/* Product Image and Overlay */}
      <div className="relative aspect-square bg-pink-50/50 overflow-hidden flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isSale && (
            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Sale
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-rose-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-pink-100 hover:bg-white text-rose-900 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${
              wishlisted ? 'fill-rose-600 text-rose-600' : 'text-rose-900'
            }`}
          />
        </button>

        {/* Product image */}
        <Link href={`/shop/${product.id}`} className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-100/50 to-rose-200/50 group-hover:scale-105 transition-transform duration-500">
          {product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="text-center p-4">
              <span className="font-serif italic font-semibold text-rose-900/60 block text-lg mb-1">
                {product.category?.name || 'Beauty'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-rose-900/40 font-bold block">
                Chadani Cosmetic
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Rating and Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase text-rose-600 tracking-wider">
            {product.category?.name || 'Skincare'}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-rose-950/80">{product.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <Link href={`/shop/${product.id}`} className="block mb-2 group-hover:text-rose-900 transition-colors">
          <h4 className="font-serif font-bold text-base text-rose-950 leading-tight line-clamp-2">
            {product.name}
          </h4>
        </Link>

        {/* Stock status indicator */}
        <div className="mb-4">
          {product.stock <= 0 ? (
            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Only {product.stock} left!</span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock</span>
          )}
        </div>

        {/* Price and CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-rose-900/40 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-rose-900">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button
            onClick={handleCartClick}
            disabled={product.stock <= 0}
            variant={product.stock <= 0 ? 'outline' : 'primary'}
            size="sm"
            className="rounded-xl px-3 py-2 shadow-sm shrink-0"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
