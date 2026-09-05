'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Sparkles, Heart } from 'lucide-react';
import Button from '../Button';

// Authentic project assets
const OWNERS_PHOTO = '/images/chadani-owners-original.jpg';
const BANGLES_THUMB = 'https://images.unsplash.com/photo-1617038260897-41a608cfd2c1?auto=format&fit=crop&q=80&w=400';
const COSMETICS_THUMB = 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=400';

export default function LuxuryHero({ categories = [] }) {
  // Resolve actual bangles and cosmetics category links from the database
  const banglesCat = categories?.find((c) => /bangle/i.test(c.name));
  const banglesHref = banglesCat ? `/shop?category=${banglesCat.id}` : '/shop?category=Traditional%20Bangles';

  const cosmeticsCat = categories?.find((c) => /cosmetic|makeup|skincare/i.test(c.name));
  const cosmeticsHref = cosmeticsCat ? `/shop?category=${cosmeticsCat.id}` : '/shop?category=Cosmetics%20%26%20Makeup';

  return (
    <section className="relative bg-brand-bg pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-12 lg:pb-14 border-b border-brand-border/40">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* MOBILE ONLY: Owners Portrait appears first (top of screen) */}
          {/* ========================================================= */}
          <div className="block lg:hidden w-full">
            <div className="bg-brand-surface p-2 sm:p-3 border border-brand-border/80 shadow-xs">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-bg">
                <Image
                  src={OWNERS_PHOTO}
                  alt="Owners of Chadani Cosmetic, a family-owned beauty and bangles store in Dharan"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-[center_32%]"
                />
              </div>
              <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-brand-dark">
                <span className="font-serif italic font-medium">Family-owned in Dharan</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-brand-muted">The Founders</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LEFT COLUMN: Editorial Copy, CTAs, Location & Trust (43%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-left">
            
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent">
              <span>FAMILY-OWNED &bull; DHARAN</span>
            </div>

            {/* Main Heading (H1) */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] text-brand-dark font-normal leading-[1.08] tracking-tight">
              Beauty, Bangles &amp; More
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm lg:text-[15px] text-brand-muted max-w-lg leading-relaxed font-normal">
              Discover beautiful bangles, cosmetics and skincare selected with care for every occasion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto px-7 py-3 text-xs tracking-[0.14em] uppercase bg-brand-dark hover:bg-brand-accent text-brand-surface font-medium transition-colors"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>

              <Link href={banglesHref} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto px-6 py-3 text-xs tracking-[0.14em] uppercase border border-brand-border text-brand-dark hover:bg-brand-surface font-medium transition-colors"
                >
                  <span>EXPLORE BANGLES</span>
                </Button>
              </Link>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-1.5 text-xs text-brand-muted pt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" strokeWidth={1.75} />
              <span className="font-medium text-brand-dark">Visit us &bull;</span>
              <span>Dharan College Road</span>
            </div>

            {/* Delivery / Trust Note */}
            <div className="pt-2 border-t border-brand-border/60 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-brand-muted">
              <span className="font-medium text-brand-dark">Dharan Delivery &bull; Flat Rs. 100</span>
              <span className="text-brand-border">&bull;</span>
              <span>Cash on Delivery</span>
              <span className="text-brand-border">&bull;</span>
              <span>100% Genuine Care</span>
            </div>

            {/* Mobile Category Teaser Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 lg:hidden">
              <Link
                href={banglesHref}
                className="group p-2.5 bg-brand-surface border border-brand-border/80 hover:border-brand-accent transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.18em] uppercase text-brand-accent mb-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Bangles</span>
                  </div>
                  <p className="text-xs font-serif font-medium text-brand-dark leading-tight">Everyday · Traditional · Trending</p>
                </div>
                <span className="text-[10px] text-brand-muted group-hover:text-brand-dark font-medium flex items-center gap-1 mt-2">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </Link>

              <Link
                href={cosmeticsHref}
                className="group p-2.5 bg-brand-surface border border-brand-border/80 hover:border-brand-accent transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.18em] uppercase text-brand-accent mb-0.5">
                    <Heart className="w-2.5 h-2.5" />
                    <span>Cosmetics</span>
                  </div>
                  <p className="text-xs font-serif font-medium text-brand-dark leading-tight">Skincare &amp; Makeup</p>
                </div>
                <span className="text-[10px] text-brand-muted group-hover:text-brand-dark font-medium flex items-center gap-1 mt-2">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP RIGHT COLUMN: Framed Portrait + Category Cards (57%) */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-3.5">
            
            {/* Framed Founders Photograph */}
            <div className="relative w-full bg-brand-surface p-3.5 border border-brand-border/80 shadow-xs">
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-brand-bg">
                <Image
                  src={OWNERS_PHOTO}
                  alt="Owners of Chadani Cosmetic, a family-owned beauty and bangles store in Dharan"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover object-[center_32%] transition-transform duration-700 ease-out hover:scale-102"
                />
              </div>

              {/* Refined Framing Caption */}
              <div className="mt-2.5 pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs px-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                  <span className="font-serif italic font-medium text-brand-dark text-[13px]">
                    Family-owned in Dharan
                  </span>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-brand-muted">
                  The people behind Chadani Cosmetic
                </span>
              </div>
            </div>

            {/* Supporting Bangles & Cosmetics Visual Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Bangles Category Entry */}
              <Link
                href={banglesHref}
                className="group flex items-center gap-3 p-2.5 bg-brand-surface border border-brand-border/75 hover:border-brand-accent transition-all"
              >
                <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-brand-bg border border-brand-border/60">
                  <Image
                    src={BANGLES_THUMB}
                    alt="Bangles collection"
                    fill
                    sizes="48px"
                    className="object-cover transition-transform duration-500 group-hover:scale-106"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.16em] uppercase text-brand-accent">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>BANGLES</span>
                  </div>
                  <p className="text-xs font-serif text-brand-dark font-medium truncate leading-tight">
                    Everyday · Traditional · Trending
                  </p>
                  <p className="text-[10px] text-brand-muted group-hover:text-brand-dark flex items-center gap-1 mt-0.5 font-medium transition-colors">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>

              {/* Cosmetics & Beauty Category Entry */}
              <Link
                href={cosmeticsHref}
                className="group flex items-center gap-3 p-2.5 bg-brand-surface border border-brand-border/75 hover:border-brand-accent transition-all"
              >
                <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-brand-bg border border-brand-border/60">
                  <Image
                    src={COSMETICS_THUMB}
                    alt="Cosmetics and skincare"
                    fill
                    sizes="48px"
                    className="object-cover transition-transform duration-500 group-hover:scale-106"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.16em] uppercase text-brand-accent">
                    <Heart className="w-2.5 h-2.5" />
                    <span>COSMETICS</span>
                  </div>
                  <p className="text-xs font-serif text-brand-dark font-medium truncate leading-tight">
                    Skincare · Makeup · Daily Care
                  </p>
                  <p className="text-[10px] text-brand-muted group-hover:text-brand-dark flex items-center gap-1 mt-0.5 font-medium transition-colors">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
