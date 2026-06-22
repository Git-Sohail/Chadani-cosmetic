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
    <motion.article
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-luxury-burgundy/8 transition-all duration-400 flex flex-col h-full border border-luxury-pink"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-luxury-pink">
        {(product.isSale || discount) && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-luxury-burgundy text-white text-[10px] font-medium uppercase tracking-wider">
            {discount ? `-${discount}%` : 'Sale'}
          </span>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            type="button"
            onClick={handleWishlist}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-luxury-burgundy text-luxury-burgundy' : 'text-luxury-burgundy'}`} />
          </motion.button>
          <Link
            href={`/shop/${product.id}`}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4 text-luxury-burgundy" />
          </Link>
        </div>

        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-luxury-burgundy/35 italic text-sm">
              {product.category?.name || 'Beauty'}
            </div>
          )}
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <motion.button
            type="button"
            onClick={handleCart}
            disabled={product.stock <= 0}
            className="w-full py-2.5 rounded-full bg-luxury-burgundy text-white text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:bg-luxury-burgundy-dark transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-luxury-rose-gold font-medium">
            {product.category?.name || 'Beauty'}
          </span>
          <div className="flex items-center gap-1 text-luxury-rose-gold">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[11px] text-luxury-text/65">{product.rating || '4.9'}</span>
          </div>
        </div>
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-serif text-base text-luxury-text leading-snug line-clamp-2 group-hover:text-luxury-burgundy transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-3 flex items-end gap-2">
          {product.oldPrice && (
            <span className="text-xs text-luxury-text/35 line-through">{formatPrice(product.oldPrice)}</span>
          )}
          <span className="text-lg font-medium text-luxury-burgundy">{formatPrice(product.price)}</span>
        </div>
      </div>
    </motion.article>
  );
}
