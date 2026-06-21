'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../Toast';
import { formatPrice } from '../../utils/currency';

export default function LuxuryProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const toast = useToast();
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = async (e) => {
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

  const handleCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      await addToCart(product, 1);
      toast(`"${product.name}" added to cart`, 'success');
    }
  };

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <motion.div
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#7a003c]/8 transition-shadow duration-500 flex flex-col h-full"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#fff5f7]">
        {product.isSale && !discount && (
          <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#7a003c] text-white text-[10px] font-semibold uppercase tracking-wider">
            Sale
          </span>
        )}
        {discount && (
          <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#c89b8f] text-white text-[10px] font-semibold">
            -{discount}%
          </span>
        )}

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleWishlist}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#7a003c] text-[#7a003c]' : 'text-[#7a003c]'}`} />
          </button>
          <Link
            href={`/shop/${product.id}`}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4 text-[#7a003c]" />
          </Link>
        </div>

        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-[#7a003c]/40 italic">
              {product.category?.name || 'Beauty'}
            </div>
          )}
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={handleCart}
            disabled={product.stock <= 0}
            className="w-full py-3 rounded-full bg-[#7a003c] text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:bg-[#5a002c] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#c89b8f] font-medium">
            {product.category?.name || 'Beauty'}
          </span>
          <div className="flex items-center gap-1 text-[#c89b8f]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs text-[#2a2a2a]/70">{product.rating || '4.9'}</span>
          </div>
        </div>
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-serif text-lg text-[#2a2a2a] leading-snug line-clamp-2 group-hover:text-[#7a003c] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex items-end gap-2">
          {product.oldPrice && (
            <span className="text-sm text-[#2a2a2a]/35 line-through">{formatPrice(product.oldPrice)}</span>
          )}
          <span className="text-xl font-medium text-[#7a003c]">{formatPrice(product.price)}</span>
        </div>
      </div>
    </motion.div>
  );
}
