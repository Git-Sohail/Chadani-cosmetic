'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../../../context/WishlistContext';
import { useCart } from '../../../../context/CartContext';
import { useToast } from '../../../../components/Toast';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { formatPrice } from '../../../../utils/currency';

export default function AccountWishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = async (item) => {
    await addToCart(item.product, 1);
    toast(`"${item.product.name}" added to cart`, 'success');
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    toast('Removed from wishlist', 'info');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-rose-950 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#7A003C] fill-[#7A003C]" /> Wishlist
        </h1>
        <p className="text-xs text-rose-900/50 font-medium mt-1">{wishlistItems.length} saved items</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-300" /></div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] border border-pink-100 p-12 text-center shadow-sm">
          <Heart className="w-12 h-12 text-rose-200 mx-auto mb-4" />
          <p className="font-black text-rose-950">Your wishlist is empty</p>
          <p className="text-xs text-rose-900/50 font-medium mt-2">Save products you love for later</p>
          <Link href="/shop" className="inline-block mt-5 px-6 py-2.5 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#5a002c] transition-colors">
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlistItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={product.id} className="bg-white rounded-[1.5rem] border border-pink-100 p-4 shadow-sm flex gap-4">
                <Link href={`/shop/${product.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 border border-pink-100 shrink-0">
                  {product.image
                    ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-rose-200"><Heart className="w-6 h-6" /></div>}
                </Link>
                <div className="flex-1 min-w-0 space-y-2">
                  <Link href={`/shop/${product.id}`} className="block font-bold text-sm text-rose-950 line-clamp-2 hover:text-[#7A003C] transition-colors">
                    {product.name}
                  </Link>
                  <p className="font-black text-[#7A003C]">{formatPrice(product.discountPrice || product.price)}</p>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => handleMoveToCart(item)}
                      disabled={product.stock <= 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7A003C] text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#5a002c] disabled:opacity-40 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button type="button" onClick={() => handleRemove(product.id)}
                      className="p-1.5 rounded-lg border border-pink-100 text-rose-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
