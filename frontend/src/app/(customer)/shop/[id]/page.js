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

function parseProductContent(rawDescription, product) {
  if (!rawDescription) {
    return {
      summary: 'Authentic formulation curated by Chadani Cosmetic for daily beauty ritual.',
      accordions: [],
    };
  }

  const text = rawDescription.trim();

  // Pattern detection for explicit sections
  const sectionKeywords = [
    { key: 'benefits', title: 'Key Benefits', regex: /(?:key benefits?|benefits?)\s*[:\-–]\s*/i },
    { key: 'howToUse', title: 'How to Use', regex: /(?:how to use|directions?|application|usage)\s*[:\-–]\s*/i },
    { key: 'ingredients', title: 'Ingredients & Composition', regex: /(?:ingredients?|composition)\s*[:\-–]\s*/i },
    { key: 'details', title: 'Product Details', regex: /(?:product details?|specifications?|about)\s*[:\-–]\s*/i },
  ];

  const matches = [];
  sectionKeywords.forEach((kw) => {
    const idx = text.search(kw.regex);
    if (idx !== -1) {
      matches.push({ key: kw.key, title: kw.title, index: idx, regex: kw.regex });
    }
  });

  matches.sort((a, b) => a.index - b.index);

  let intro = text;
  const accordions = [];

  if (matches.length > 0) {
    intro = text.slice(0, matches[0].index).trim();
    for (let i = 0; i < matches.length; i++) {
      const curr = matches[i];
      const nextIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const rawChunk = text.slice(curr.index, nextIdx).trim();
      const content = rawChunk.replace(curr.regex, '').trim();
      if (content) {
        accordions.push({
          id: curr.key,
          title: curr.title,
          content,
        });
      }
    }
  }

  // Create a concise 2-4 line summary from intro
  let summary = intro;
  const paragraphs = intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    summary = paragraphs[0];
  } else {
    const sentences = intro.split(/(?<=[.!?])\s+/);
    if (sentences.length > 2 && intro.length > 190) {
      summary = sentences.slice(0, 2).join(' ');
    }
  }

  // If no explicit sections were found, provide Product Details with full text & usage
  if (accordions.length === 0) {
    accordions.push({
      id: 'details',
      title: 'Product Details & Description',
      content: text,
    });
    accordions.push({
      id: 'usage',
      title: 'How to Use & Application',
      content: 'Apply a coin-sized amount onto damp face and neck. Gently massage in upward circular motions for 1–2 minutes, avoiding direct contact with eyes. Rinse thoroughly with lukewarm water and pat dry. Recommended for daily morning and evening skincare rituals.',
    });
  }

  // Always include Authenticity & Dharan Dispatch policy section
  accordions.push({
    id: 'dispatch',
    title: 'Authenticity & Dharan Dispatch Guarantee',
    content: `100% genuine formulation sourced directly from authorized beauty distributors. Hand-inspected and packed in Dharan with flat Rs. 100 doorstep delivery across all Dharan wards. Cash on delivery available. SKU: ${product?.sku || 'CHD-PRD'}.`,
  });

  return { summary: summary || text, accordions };
}

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
  const [openAccordion, setOpenAccordion] = useState('details');

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
      toast(`Added ${quantity} × "${product.name}" to bag`, 'success');
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

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Recognize brand from title prefix or fallback to category name
  const brandOrCategory = useMemo(() => {
    if (!product) return '';
    const name = product.name || '';
    const knownBrands = [
      'Mamaearth', 'Cetaphil', 'Minimalist', 'The Ordinary', 'Plum', 'Dot & Key',
      'Garnier', "L'Oreal", 'Biotique', 'Neutrogena', 'COSRX', 'Innisfree',
      'Derma Co', 'Himalaya', 'Nivea', 'Dove', 'Tresemme', 'Maybelline', 'Lakme',
      'Swiss Beauty', 'Insight', 'Faces Canada', 'Colorbar'
    ];
    const matched = knownBrands.find((b) => name.toLowerCase().startsWith(b.toLowerCase()));
    return matched || product.category?.name || 'Cosmetic Essentials';
  }, [product]);

  const { summary, accordions } = useMemo(() => {
    return parseProductContent(product?.description, product);
  }, [product]);

  // Extract key cosmetic attributes for quick scanning
  const productSpecs = useMemo(() => {
    if (!product) return [];
    const specs = [];
    const volMatch = product.name?.match(/\b\d+(\.\d+)?\s*(ml|g|gm|kg|oz|l)\b/i);
    if (volMatch) {
      specs.push({ label: 'Size', value: volMatch[0] });
    }
    if (product.category?.name) {
      specs.push({ label: 'Category', value: product.category.name });
    }
    specs.push({ label: 'Formulation', value: 'Dermatologically Curated' });
    if (product.sku) {
      specs.push({ label: 'SKU', value: product.sku });
    }
    return specs;
  }, [product]);

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
          <div className="h-4 bg-brand-border/60 w-32 mb-6 rounded" />
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-brand-surface border border-brand-border p-6 sm:p-8">
            <div className="w-full lg:w-[46%] aspect-[4/5] bg-brand-border/40" />
            <div className="w-full lg:w-[54%] space-y-4 pt-2">
              <div className="h-3 bg-brand-border/40 w-1/4" />
              <div className="h-7 bg-brand-border/40 w-3/4" />
              <div className="h-6 bg-brand-border/40 w-1/3" />
              <div className="h-16 bg-brand-border/40 w-full" />
              <div className="h-11 bg-brand-border/40 w-full" />
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

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: galleryImages,
        sku: product.sku || undefined,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'NPR',
          price: pricing.activePrice,
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
      }
    : null;

  return (
    <div className="bg-brand-bg min-h-screen">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6 text-xs text-brand-muted">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-brand-text hover:text-brand-accent transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-[11px]">
            <Link href="/" className="hover:text-brand-dark transition-colors">Home</Link>
            <span className="text-brand-border">/</span>
            <Link href="/shop" className="hover:text-brand-dark transition-colors">Catalogue</Link>
            {product.category && (
              <>
                <span className="text-brand-border">/</span>
                <Link href={`/shop?category=${product.categoryId}`} className="hover:text-brand-dark transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-brand-border">/</span>
            <span className="text-brand-dark font-medium truncate max-w-[220px]">{product.name}</span>
          </nav>
        </div>

        {/* Primary Product Showcase: Balanced Proportions (Left 46% / Right 54%) */}
        <div className="flex flex-col lg:flex-row items-start gap-7 lg:gap-11 bg-brand-surface border border-brand-border/80 p-5 sm:p-7 lg:p-9 mb-12 sm:mb-16">
          {/* Left Column: Image Gallery (46% width on desktop) */}
          <div className="w-full lg:w-[46%] shrink-0 space-y-3">
            <div className="relative aspect-[4/5] max-h-[480px] sm:max-h-[520px] lg:max-h-[530px] bg-brand-bg/50 border border-brand-border/70 overflow-hidden group flex items-center justify-center">
              {/* Discount / Sale Flag */}
              {(product.isSale || pricing.hasDiscount) && (
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-brand-dark text-brand-surface text-[9px] font-medium tracking-[0.16em] uppercase">
                  {pricing.discountPercent ? `-${pricing.discountPercent}%` : 'Special'}
                </span>
              )}

              {/* Main Image with Containment */}
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-contain p-4 sm:p-6 cursor-zoom-in transition-transform duration-700 hover:scale-103"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-brand-muted/40 italic text-base">
                  {product.category?.name || 'Product'}
                </div>
              )}

              {/* Lightbox Zoom Trigger */}
              {activeImage && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-brand-surface/90 border border-brand-border flex items-center justify-center text-brand-dark hover:text-brand-accent hover:border-brand-accent transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Inspect image in fullscreen"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Thumbnail Navigator (Compact Row) */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-16 sm:w-16 sm:h-18 aspect-[4/5] bg-brand-bg/50 border overflow-hidden shrink-0 transition-all cursor-pointer p-1 ${
                      activeImageIndex === idx
                        ? 'border-brand-dark ring-1 ring-brand-dark'
                        : 'border-brand-border/70 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="70px" className="object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Hierarchy & Purchase Area (54% width on desktop) */}
          <div className="w-full lg:w-[54%] flex flex-col space-y-4">
            {/* Brand/Category Eyebrow & Star Rating */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
                {brandOrCategory}
              </span>

              <a
                href="#reviews"
                className="flex items-center gap-1.5 text-xs text-brand-dark hover:text-brand-accent transition-colors"
                title="Jump to customer reviews"
              >
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
                <span className="text-brand-muted font-medium text-[11px]">
                  {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                </span>
                <span className="text-brand-muted/70 text-[11px]">
                  (Reviews)
                </span>
              </a>
            </div>

            {/* Product Title: Compact Cormorant Garamond */}
            <h1 className="font-serif text-xl sm:text-2xl lg:text-[clamp(1.75rem,2.2vw,2.35rem)] text-brand-dark font-normal tracking-tight leading-[1.14]">
              {product.name}
            </h1>

            {/* Pricing Display: Prominent & Refined (30-34px) with subtle strikethrough */}
            <div className="flex items-baseline gap-2.5 pt-0.5 flex-wrap">
              <span className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-medium text-brand-dark tracking-tight leading-none">
                {formatPrice(pricing.activePrice)}
              </span>
              {pricing.oldPrice && (
                <span className="text-xs sm:text-sm text-brand-muted/60 line-through font-sans">
                  {formatPrice(pricing.oldPrice)}
                </span>
              )}
              {pricing.discountPercent && (
                <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-accent border border-brand-accent/40 px-2 py-0.5 rounded-xs">
                  Save {pricing.discountPercent}%
                </span>
              )}
            </div>

            {/* Stock Status Indicator: Quiet, Refined Pill Badge */}
            <div>
              {product.stock <= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-medium text-red-700 bg-red-50/70 border border-red-200/80 rounded-full">
                  Currently Out of Stock
                </span>
              ) : product.stock < 5 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-medium text-brand-accent bg-brand-bg border border-brand-accent/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                  Limited stock &bull; {product.stock} remaining
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-medium text-emerald-800 bg-emerald-50/50 border border-emerald-200/80 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  In Stock &bull; Ready for Dharan Dispatch
                </span>
              )}
            </div>

            {/* Concise Product Introduction (2–4 lines) */}
            <div className="pt-2 text-xs sm:text-[13px] text-brand-muted leading-relaxed border-t border-brand-border/60">
              <p>{summary}</p>
            </div>

            {/* Attribute Badges / Spec Chips */}
            {productSpecs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {productSpecs.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-brand-dark bg-brand-bg/70 border border-brand-border/70 rounded-xs font-mono"
                  >
                    <span className="text-brand-muted">{spec.label}:</span>
                    <strong className="font-sans font-medium text-brand-dark">{spec.value}</strong>
                  </span>
                ))}
              </div>
            )}

            {/* Purchasing Controls: Quantity + Primary Add to Cart */}
            {product.stock > 0 && (
              <div className="pt-2 border-t border-brand-border/60 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Compact Quantity Selector (120-130px × 44-46px) */}
                  <div className="w-full sm:w-[124px] h-[46px] border border-brand-border bg-brand-surface rounded-xs inline-flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-9 h-full flex items-center justify-center text-brand-dark hover:bg-brand-bg transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      &minus;
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-brand-dark font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="w-9 h-full flex items-center justify-center text-brand-dark hover:bg-brand-bg transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      &#43;
                    </button>
                  </div>

                  {/* Primary Add to Shopping Bag Action */}
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="md"
                    className="flex-1 h-[46px] py-0 tracking-[0.16em] uppercase text-xs font-medium"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2 shrink-0" />
                    <span>Add to Shopping Bag</span>
                  </Button>

                  {/* Wishlist Toggle Button */}
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`w-[46px] h-[46px] border flex items-center justify-center transition-colors cursor-pointer shrink-0 rounded-xs ${
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

            {/* Factual Delivery & Trust Pillars */}
            <div className="pt-2 border-t border-brand-border/50 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-brand-muted">
                <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Dharan Delivery &bull; Flat Rs. 100 &bull; Cash on Delivery Available</span>
              </div>

              {/* Clean Luxury Guarantee Strip */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 p-2 bg-brand-bg/50 border border-brand-border/60 text-[10px] text-brand-muted rounded-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span className="truncate">100% Genuine</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-brand-bg/50 border border-brand-border/60 text-[10px] text-brand-muted rounded-xs">
                  <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span className="truncate">Dharan Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-brand-bg/50 border border-brand-border/60 text-[10px] text-brand-muted rounded-xs">
                  <RotateCcw className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span className="truncate">Pay on Delivery</span>
                </div>
              </div>
            </div>

            {/* Detailed Product Information: Clean Structured Accordions */}
            {accordions.length > 0 && (
              <div className="pt-2 border-t border-brand-border/60">
                {accordions.map((sec) => {
                  const isOpen = openAccordion === sec.id;
                  return (
                    <div key={sec.id} className="border-b border-brand-border/50 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(sec.id)}
                        className="w-full py-3 flex items-center justify-between text-left text-xs font-medium uppercase tracking-[0.14em] text-brand-dark hover:text-brand-accent transition-colors cursor-pointer group"
                        aria-expanded={isOpen}
                      >
                        <span>{sec.title}</span>
                        <span className="text-brand-muted text-sm group-hover:text-brand-accent transition-colors font-mono">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pb-3 text-xs text-brand-muted leading-relaxed whitespace-pre-line animate-fadeIn">
                          {sec.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
