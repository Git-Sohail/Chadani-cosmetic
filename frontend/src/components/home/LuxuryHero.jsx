'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Sparkles, Heart } from 'lucide-react';
import Button from '../Button';

// Guaranteed local high-resolution assets from catalog
const BANGLES_HERO_IMAGE = '/images/bangles-hero.jpg';
const COSMETICS_HERO_IMAGE = '/images/cosmetics-hero.jpg';
const OWNERS_PHOTO = '/images/chadani-owners-original.jpg';

export default function LuxuryHero({ categories = [] }) {
  // Resolve actual bangles and cosmetics category links from the database
  const banglesCat = categories?.find((c) => /bangle/i.test(c.name));
  const banglesHref = banglesCat ? `/shop?category=${banglesCat.id}` : '/shop?category=Traditional%20Bangles';

  const cosmeticsCat = categories?.find((c) => /cosmetic|makeup|skincare/i.test(c.name));
  const cosmeticsHref = cosmeticsCat ? `/shop?category=${cosmeticsCat.id}` : '/shop?category=Cosmetics%20%26%20Makeup';

  return (
    <section className="relative bg-brand-bg pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-10 lg:pb-12 border-b border-brand-border/40">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Editorial Copy, CTAs, Location & Trust (43%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-left">
            
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent">
              <span>FAMILY-OWNED &bull; DHARAN</span>
            </div>

            {/* Main Heading (H1) */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] text-brand-dark font-normal leading-[1.08] tracking-tight">
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

            {/* ========================================================= */}
            {/* MOBILE ONLY: Balanced visual showcase beneath copy         */}
            {/* ========================================================= */}
            <div className="block lg:hidden space-y-3 pt-2">
              {/* Primary Mobile Bangles Feature */}
              <Link
                href={banglesHref}
                className="group relative block aspect-[16/10] w-full overflow-hidden bg-brand-surface border border-brand-border/80 shadow-xs"
              >
                <Image
                  src={BANGLES_HERO_IMAGE}
                  alt="Chadani Bangle Collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-brand-surface flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-accent block mb-0.5">
                      Primary Department
                    </span>
                    <h2 className="font-serif text-xl font-medium text-white">BANGLES</h2>
                    <p className="text-[11px] text-brand-surface/85">Traditional · Everyday · Trending</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-white group-hover:text-brand-accent flex items-center gap-1 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* Mobile Secondary Grid: Founders + Cosmetics Duo */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Founders Card */}
                <div className="bg-brand-surface p-2 border border-brand-border/80 shadow-xs flex flex-col justify-between">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-bg">
                    <Image
                      src={OWNERS_PHOTO}
                      alt="Owners of Chadani Cosmetic, family-owned in Dharan"
                      fill
                      sizes="(max-width: 768px) 50vw, 250px"
                      className="object-cover object-[center_34%]"
                    />
                  </div>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-brand-dark">
                    <span className="font-serif italic font-medium">Family-owned in Dharan</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                  </div>
                </div>

                {/* Cosmetics Card */}
                <Link
                  href={cosmeticsHref}
                  className="group bg-brand-surface p-2 border border-brand-border/80 shadow-xs flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-bg">
                    <Image
                      src={COSMETICS_HERO_IMAGE}
                      alt="Cosmetics and beauty products"
                      fill
                      sizes="(max-width: 768px) 50vw, 250px"
                      className="object-cover transition-transform group-hover:scale-104"
                    />
                  </div>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-brand-dark">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-brand-accent">Cosmetics</p>
                      <p className="font-serif text-xs font-medium text-brand-dark truncate">Skincare &amp; Beauty</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-brand-muted group-hover:text-brand-dark transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* DESKTOP RIGHT COLUMN: Editorial Boutique Composition (57%)*/}
          {/* Bangles: Primary (58%) | Founders + Cosmetics: Secondary (42%) */}
          {/* ========================================================= */}
          <div className="hidden lg:grid lg:col-span-7 grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            
            {/* ------------------------------------------------------- */}
            {/* PRIMARY HERO FEATURE: Bangles Showcase (Cols 1-7)      */}
            {/* ------------------------------------------------------- */}
            <div className="col-span-7">
              <Link
                href={banglesHref}
                className="group relative flex flex-col justify-between w-full h-full min-h-[460px] overflow-hidden bg-brand-surface border border-brand-border/80 shadow-xs p-5"
              >
                {/* Background Bangle Product Image */}
                <Image
                  src={BANGLES_HERO_IMAGE}
                  alt="Chadani Bangle Collection - Traditional, Everyday, Trending"
                  fill
                  priority
                  sizes="(max-width: 1280px) 45vw, 420px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                />

                {/* Subtle Editorial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/35 to-brand-dark/10" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface/95 backdrop-blur-xs text-brand-dark text-[10px] font-mono uppercase tracking-[0.2em] border border-brand-border/60">
                    <Sparkles className="w-2.5 h-2.5 text-brand-accent" />
                    <span>Featured Category</span>
                  </span>
                </div>

                {/* Bottom Editorial Copy */}
                <div className="relative z-10 space-y-1.5 text-brand-surface pt-24">
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-brand-surface/80 block">
                    Boutique Specialty
                  </span>
                  <h2 className="font-serif text-3xl xl:text-4xl text-white font-medium tracking-tight leading-tight">
                    BANGLES
                  </h2>
                  <p className="text-xs text-brand-surface/90 font-light">
                    Traditional · Everyday · Trending
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white group-hover:text-brand-accent transition-colors">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* ------------------------------------------------------- */}
            {/* SECONDARY STACK: Founders Trust Card + Cosmetics Card   */}
            {/* ------------------------------------------------------- */}
            <div className="col-span-5 flex flex-col justify-between gap-3.5">
              
              {/* TOP: Refined Founders Trust Card (~38% visual weight) */}
              <div className="bg-brand-surface p-2.5 sm:p-3 border border-brand-border/80 shadow-xs flex flex-col justify-between">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-bg border border-brand-border/50">
                  <Image
                    src={OWNERS_PHOTO}
                    alt="Owners of Chadani Cosmetic, family-owned in Dharan"
                    fill
                    priority
                    sizes="(max-width: 1280px) 25vw, 240px"
                    className="object-cover object-[center_34%]"
                  />
                </div>
                {/* Subtle caption */}
                <div className="pt-2 flex items-center justify-between text-xs px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                    <span className="font-serif italic font-medium text-brand-dark text-xs">
                      Family-owned in Dharan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-brand-muted">
                    Founders
                  </span>
                </div>
              </div>

              {/* BOTTOM: Secondary Cosmetics & Skincare Feature */}
              <Link
                href={cosmeticsHref}
                className="group bg-brand-surface p-2.5 sm:p-3 border border-brand-border/80 shadow-xs flex flex-col justify-between hover:border-brand-accent transition-all"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-bg border border-brand-border/50">
                  <Image
                    src={COSMETICS_HERO_IMAGE}
                    alt="Cosmetics, skincare and beauty treatments"
                    fill
                    sizes="(max-width: 1280px) 25vw, 240px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                {/* Label & link */}
                <div className="pt-2 flex items-center justify-between text-xs px-0.5">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.14em] uppercase text-brand-accent">
                      <Heart className="w-2.5 h-2.5" />
                      <span>COSMETICS</span>
                    </div>
                    <p className="font-serif text-xs font-medium text-brand-dark truncate leading-tight mt-0.5">
                      Skincare &amp; Daily Makeup
                    </p>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-brand-muted group-hover:text-brand-dark flex items-center gap-0.5 transition-colors">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
