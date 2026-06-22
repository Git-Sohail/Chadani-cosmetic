'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';
import { formatPrice } from '../utils/currency';

export default function ProductCard({ product }) {
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
    <motion.div
      className="group relative bg-white border border-luxury-pink rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-luxury-burgundy/8 transition-all duration-300 flex flex-col h-full"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-[200px] sm:h-[220px] lg:h-[260px] bg-luxury-pink overflow-hidden">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isSale && (
            <span className="bg-luxury-burgundy text-white text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-luxury-rose-gold text-white text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-luxury-burgundy text-luxury-burgundy' : 'text-luxury-burgundy'}`} />
          </button>
          <Link href={`/shop/${product.id}`} className="w-9 h-9 rounded-full glass-card flex items-center justify-center" aria-label="Quick view">
            <Eye className="w-4 h-4 text-luxury-burgundy" />
          </Link>
        </div>

        <Link href={`/shop/${product.id}`} className="w-full h-full block">
          {product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-luxury-burgundy/40 italic">
              {product.category?.name || 'Beauty'}
            </div>
          )}
        </Link>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium uppercase text-luxury-rose-gold tracking-wider">
            {product.category?.name || 'Skincare'}
          </span>
          <div className="flex items-center gap-1 text-luxury-rose-gold">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs text-luxury-text/70">{product.rating}</span>
          </div>
        </div>

        <Link href={`/shop/${product.id}`} className="block mb-2 group-hover:text-luxury-burgundy transition-colors">
          <h4 className="font-serif font-medium text-base text-luxury-text leading-tight line-clamp-2">
            {product.name}
          </h4>
        </Link>

        <div className="mb-3">
          {product.stock <= 0 ? (
            <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Only {product.stock} left</span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-luxury-text/35 line-through">{formatPrice(product.oldPrice)}</span>
            )}
            <span className="text-lg font-medium text-luxury-burgundy">{formatPrice(product.price)}</span>
          </div>
          <Button
            onClick={handleCartClick}
            disabled={product.stock <= 0}
            variant={product.stock <= 0 ? 'outline' : 'primary'}
            size="sm"
            className="rounded-full px-3 py-2 shrink-0"
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
