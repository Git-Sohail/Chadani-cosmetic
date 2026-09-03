'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../../../../components/ProductCard';
import Button from '../../../../components/Button';
import ReviewSection from '../../../../components/ReviewSection';
import { useToast } from '../../../../components/Toast';
import {
  Heart,
  ShoppingBag,
  Star,
  MapPin,
  ArrowLeft,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { useCart } from '../../../../context/CartContext';
import { useWishlist } from '../../../../context/WishlistContext';
import { formatPrice, getProductPricing } from '../../../../utils/currency';

export default function ProductDetails() {
  const { API_URL } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const toast = useToast();

  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const wishlisted = product ? isWishlisted(product.id) : false;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
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
      setRelatedProducts(res.data.relatedProducts || []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Product not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (product && product.stock > 0) {
      await addToCart(product, quantity);
      toast(`Added ${quantity} × "${product.name}" to cart`, 'success');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (wishlisted) {
      await removeFromWishlist(product.id);
      toast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(product);
      toast('Saved to wishlist', 'success');
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-pulse">
          <div className="h-4 bg-brand-border/60 w-32 mb-8 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-brand-surface border border-brand-border p-6 sm:p-10">
            <div className="lg:col-span-6 aspect-[4/5] bg-brand-border/40" />
            <div className="lg:col-span-6 space-y-6 pt-4">
              <div className="h-3 bg-brand-border/40 w-1/4" />
              <div className="h-8 bg-brand-border/40 w-3/4" />
              <div className="h-6 bg-brand-border/40 w-1/3" />
              <div className="h-24 bg-brand-border/40 w-full" />
              <div className="h-12 bg-brand-border/40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center py-20 px-4">
        <div className="bg-brand-surface border border-brand-border p-10 text-center max-w-md w-full">
          <h2 className="font-serif text-2xl text-brand-dark mb-2">Item Unavailable</h2>
          <p className="text-xs sm:text-sm text-brand-muted mb-6 leading-relaxed">
            {error || 'This product is currently not available in our catalogue.'}
          </p>
          <Button onClick={() => router.push('/shop')} variant="primary" size="md">
            Browse All Products
          </Button>
        </div>
      </div>
    );
  }

  const pricing = getProductPricing(product);
  const activeImage = galleryImages[activeImageIndex] || product.image;

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 text-xs text-brand-muted">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-brand-text hover:text-brand-accent transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:text-brand-dark">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-dark">Catalogue</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/shop?category=${product.categoryId}`} className="hover:text-brand-dark">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-brand-dark font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Primary Product Showcase: 2-Column Balanced Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 bg-brand-surface border border-brand-border p-5 sm:p-8 lg:p-12 mb-16 sm:mb-20">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden group">
              {/* Discount / Sale Flag */}
              {(product.isSale || pricing.hasDiscount) && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-brand-dark text-brand-surface text-[10px] font-medium tracking-[0.16em] uppercase">
                  {pricing.discountPercent ? `-${pricing.discountPercent}%` : 'Special'}
                </span>
              )}

              {/* Main Image */}
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center cursor-zoom-in transition-transform duration-700 hover:scale-102"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-brand-muted/40 italic text-lg">
                  {product.category?.name || 'Product'}
                </div>
              )}

              {/* Lightbox Zoom Trigger */}
              {activeImage && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 w-9 h-9 bg-brand-surface/90 border border-brand-border flex items-center justify-center text-brand-dark hover:text-brand-accent hover:border-brand-accent transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Inspect image in fullscreen"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Thumbnail Navigator (Only if multiple images exist) */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 sm:w-20 aspect-[4/5] bg-brand-bg border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-brand-dark ring-1 ring-brand-dark'
                        : 'border-brand-border opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Hierarchy & Purchase Area */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent">
                  {product.category?.name || 'Cosmetics'}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-brand-dark">
                  <div className="flex items-center text-brand-accent">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.rating || 5)
                            ? 'fill-brand-accent text-brand-accent'
                            : 'text-brand-border fill-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-brand-muted font-medium">
                    {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-medium text-brand-dark">
                  {formatPrice(pricing.activePrice)}
                </span>
                {pricing.oldPrice && (
                  <span className="text-sm sm:text-base text-brand-muted/60 line-through">
                    {formatPrice(pricing.oldPrice)}
                  </span>
                )}
                {pricing.discountPercent && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-accent border border-brand-accent/40 px-2 py-0.5">
                    Save {pricing.discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="pt-1">
                {product.stock <= 0 ? (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1">
                    Currently Out of Stock
                  </span>
                ) : product.stock < 5 ? (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1">
                    Limited Stock: {product.stock} items remaining
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                    In Stock &bull; Ready for Dharan Dispatch
                  </span>
                )}
              </div>

              {/* Product Description */}
              <div className="pt-2 text-xs sm:text-sm text-brand-muted leading-relaxed border-t border-brand-border/60">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Purchasing Controls */}
            {product.stock > 0 && (
              <div className="pt-4 border-t border-brand-border/60 space-y-4">
                {/* Quantity Control */}
                <div className="flex items-center gap-4">
                  <label htmlFor="qty-select" className="text-xs font-medium text-brand-muted uppercase tracking-wider">
                    Quantity
                  </label>
                  <div className="inline-flex items-center border border-brand-border bg-brand-bg rounded">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-surface disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px]"
                      aria-label="Decrease quantity"
                    >
                      &minus;
                    </button>
                    <span id="qty-select" className="w-10 text-center text-xs font-semibold text-brand-dark font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-surface disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px]"
                      aria-label="Increase quantity"
                    >
                      &#43;
                    </button>
                  </div>
                </div>

                {/* Primary Add to Cart & Wishlist Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    className="flex-1 py-3.5 tracking-[0.18em] uppercase text-xs min-h-[44px]"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    <span>Add to Shopping Bag</span>
                  </Button>

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`px-4 border flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
                      wishlisted
                        ? 'bg-brand-dark border-brand-dark text-brand-surface'
                        : 'border-brand-border bg-brand-surface text-brand-dark hover:border-brand-accent'
                    }`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Factual Delivery & Policy Block (Requirement 1 & 16) */}
            <div className="border border-brand-border bg-brand-bg p-4 space-y-2 text-xs text-brand-muted">
              <div className="flex items-center gap-2 text-brand-dark font-medium text-xs">
                <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Delivery in Dharan &bull; Flat Rs. 100</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Direct doorstep delivery across all Dharan wards. Cash on Delivery is available upon arrival.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ReviewSection productId={productId} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-16 sm:py-20 border-t border-brand-border/60 mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
                  Complementary
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal tracking-tight">
                  Related Products
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors self-start sm:self-end"
              >
                View Full Collection &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {lightboxOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-brand-dark/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-brand-accent p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full aspect-[4/5] max-h-[80vh] overflow-hidden bg-brand-bg border border-brand-border">
              <Image src={activeImage} alt={product.name} fill className="object-contain" priority />
            </div>

            {/* Multiple Photo Switcher inside Lightbox */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-4 mt-4 text-white text-xs font-mono">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))
                  }
                  className="p-2 hover:text-brand-accent min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span>
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))
                  }
                  className="p-2 hover:text-brand-accent min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
