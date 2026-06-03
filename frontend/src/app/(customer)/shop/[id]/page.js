'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '../../../../components/ProductCard';
import Button from '../../../../components/Button';
import { Heart, ShoppingCart, Star, Sparkles, ShieldCheck, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { useCart } from '../../../../context/CartContext';
import { useWishlist } from '../../../../context/WishlistContext';
import { formatPrice } from '../../../../utils/currency';

export default function ProductDetails() {
  const { API_URL } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const wishlisted = product ? isWishlisted(product.id) : false;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    return product.image ? [product.image] : [];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products/${productId}`);
      setProduct(res.data.product);
      setRelatedProducts(res.data.relatedProducts);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock > 0) {
      await addToCart(product, quantity);
      alert(`Added ${quantity} x "${product.name}" to cart!`);
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-8 bg-pink-100 rounded w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[2.5rem] p-10">
            <div className="aspect-square bg-pink-50 rounded-[2rem]" />
            <div className="space-y-6">
              <div className="h-6 bg-pink-50 rounded w-1/4" />
              <div className="h-10 bg-pink-50 rounded w-3/4" />
              <div className="h-8 bg-pink-50 rounded w-1/2" />
              <div className="h-24 bg-pink-50 rounded w-full" />
              <div className="h-12 bg-pink-50 rounded w-1/2" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white border border-pink-100 rounded-[2.5rem] p-12 shadow-sm inline-block max-w-lg">
            <span className="text-4xl mb-4 block">🥀</span>
            <h2 className="text-2xl font-serif font-black text-rose-950 mb-4">{error || 'Product Not Found'}</h2>
            <Button onClick={() => router.push('/shop')} variant="primary">Return to Shop</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-rose-900/60 hover:text-rose-950 mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to products</span>
        </button>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white border border-pink-100/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-16 overflow-hidden">
          
          {/* Left Side: image gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gradient-to-tr from-pink-100/50 to-rose-200/50 border border-pink-100">
              {product.isSale && (
                <span className="absolute top-5 left-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg z-10 animate-bounce">
                  SALE
                </span>
              )}

              {galleryImages.length > 0 ? (
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center p-8">
                  <div>
                    <Sparkles className="w-16 h-16 text-rose-900/20 mx-auto mb-3" />
                    <p className="font-serif italic font-bold text-rose-950/70 text-3xl">
                      {product.category?.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-rose-900/40 font-extrabold mt-2">
                      Chadani Cosmetic Premium
                    </p>
                  </div>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === index
                        ? 'border-rose-600 ring-2 ring-rose-200'
                        : 'border-pink-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Purchase Controls */}
          <div className="flex flex-col justify-center space-y-7">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest bg-pink-100/50 px-4 py-1.5 rounded-full">
                {product.category?.name}
              </span>
              <div className="flex items-center gap-2 text-amber-500">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-rose-950/60 uppercase">
                  {product.rating} (Verified)
                </span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-rose-950 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-rose-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-rose-900/30 line-through font-bold">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="flex items-center">
              {product.stock <= 0 ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 shadow-sm">
                  Out of Stock
                </span>
              ) : product.stock < 5 ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 shadow-sm">
                  Limited Availability: Only {product.stock} Left!
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 shadow-sm">
                  In Stock & Ready to Ship
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-rose-900/70 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Purchase Operations */}
            {product.stock > 0 && (
              <div className="pt-6 border-t border-pink-50 space-y-6">
                <div className="flex items-center gap-6">
                  <span className="text-xs font-black text-rose-950/60 uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center bg-pink-50 border border-pink-100 rounded-2xl p-1.5 shadow-inner">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-rose-900 hover:text-white text-rose-950 font-black flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-base text-rose-950">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-rose-900 hover:text-white text-rose-950 font-black flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    className="flex-1 py-4.5 rounded-2xl shadow-xl hover:shadow-rose-900/20 active:scale-98 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Secure Purchase
                  </Button>
                  
                  <button
                    onClick={handleWishlistToggle}
                    className={`px-6 py-4 rounded-2xl border flex items-center justify-center transition-all duration-300 active:scale-98 cursor-pointer ${
                      wishlisted
                        ? 'bg-rose-900 border-rose-900 text-white shadow-lg'
                        : 'bg-white border-pink-100 text-rose-950 hover:bg-pink-50'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        wishlisted ? 'fill-white text-white' : ''
                      }`}
                    />
                    <span className="ml-3 font-bold text-xs uppercase tracking-widest">
                      {wishlisted ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-pink-50 text-[10px] font-black uppercase tracking-widest text-rose-900/50">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Express Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Hassle-Free Returns</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="space-y-10 py-12">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Curated For You</span>
              <h3 className="text-3xl font-serif font-black text-rose-950">
                Complete Your Look
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  );
}
