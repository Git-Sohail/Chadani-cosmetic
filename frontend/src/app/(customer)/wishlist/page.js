'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import ProductCard from '../../../components/ProductCard';
import { useWishlist } from '../../../context/WishlistContext';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, loading } = useWishlist();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-extrabold text-rose-950 mb-8 flex items-center gap-2.5">
          <Heart className="w-7 h-7 text-rose-600 fill-rose-600 animate-pulse" />
          Your Wishlist
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 animate-pulse">
                <div className="aspect-square bg-pink-50 rounded-2xl" />
                <div className="h-4 bg-pink-50 rounded w-2/3" />
                <div className="h-10 bg-pink-50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-[2rem] border border-pink-100/60 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-5 text-rose-600 text-2xl">
              💝
            </div>
            <h2 className="font-serif font-extrabold text-xl text-rose-950 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-rose-900/60 mb-8 max-w-sm">
              Save your favorite cosmetics, skincare treatments, or bangle pieces for later while browsing our collections.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
