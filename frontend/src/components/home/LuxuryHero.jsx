'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Sparkles, Heart, ShieldCheck, Users } from 'lucide-react';
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
            <p className="text-sm sm:text-base text-[#685B52] max-w-md leading-relaxed font-normal">
              Beautiful bangles, cosmetics and skincare selected with genuine care for our community.
            </p>

            {/* CTA Buttons (Clean pill button + text link, zero box) */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href="/shop">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#201815] text-[#FAF6F0] text-xs font-medium tracking-[0.16em] uppercase hover:bg-brand-accent transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </Link>

              <Link 
                href={banglesHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.16em] uppercase text-brand-dark hover:text-brand-accent transition-colors py-2 group cursor-pointer"
              >
                <span>EXPLORE BANGLES</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-2 text-xs text-[#5F534B] pt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" strokeWidth={2} />
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
            {/* MOBILE ONLY: Naturally integrated products & owners visual */}
            {/* ========================================================= */}
            <div className="block lg:hidden space-y-4 pt-2">
              {/* The Founders: Integrated with soft vignette, zero harsh box */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <div
                  className="relative w-full h-full"
                  style={{
                    maskImage: 'radial-gradient(ellipse 90% 85% at 50% 40%, black 60%, transparent 98%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 40%, black 60%, transparent 98%)',
                  }}
                >
                  <Image
                    src={OWNERS_PHOTO}
                    alt="Owners of Chadani Cosmetic, family-owned in Dharan"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover object-[center_34%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F4ECE1] via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-[#8A6A4B]/10 mix-blend-color" />
                </div>
              </div>

              {/* Lower Boutique Counter: Real Bangles & Cosmetics resting naturally */}
              <div className="bg-gradient-to-r from-[#E8DFC8] via-[#F2EAE0] to-[#E8DFC8] rounded-2xl p-4 shadow-sm border border-[#E0D5BE]/80">
                <div className="space-y-3">
                  {/* Bangles Feature */}
                  <div className="flex items-center gap-3">
                    <Link href={banglesHref} className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-xs border border-[#D5C9AE]">
                      <Image
                        src={BANGLES_HERO_IMAGE}
                        alt="Handcrafted Kundan Bangles"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.18em] uppercase text-brand-accent">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Featured Specialty</span>
                      </div>
                      <Link href={banglesHref} className="font-serif text-base font-medium text-brand-dark hover:text-brand-accent transition-colors block leading-tight">
                        BANGLES
                      </Link>
                      <p className="text-[11px] text-[#6E6157] truncate">
                        Traditional &bull; Everyday &bull; Trending
                      </p>
                      <Link href={banglesHref} className="inline-flex items-center gap-1 text-[10px] font-medium tracking-[0.14em] uppercase text-brand-dark hover:text-brand-accent transition-colors">
                        <span>Explore Collection</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Cosmetics Feature */}
                  <div className="flex items-center gap-3 border-t border-[#D5C9AE]/80 pt-2.5">
                    <Link href={cosmeticsHref} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden shadow-xs border border-[#D5C9AE]">
                      <Image
                        src={COSMETICS_HERO_IMAGE}
                        alt="Cosmetics and Skincare Essentials"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-brand-accent block">
                        Beauty
                      </span>
                      <Link href={cosmeticsHref} className="font-serif text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors block truncate">
                        Cosmetics &amp; Skincare
                      </Link>
                      <Link href={cosmeticsHref} className="inline-flex items-center gap-1 text-[10px] font-medium tracking-[0.12em] uppercase text-[#6E6157] hover:text-brand-dark transition-colors">
                        <span>View All</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* DESKTOP RIGHT COLUMN: Seamless Unboxed Natural Boutique    */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-7 relative flex-col items-center justify-center">

            {/* Top-Right Open Air Editorial Founder Quote */}
            <div className="absolute -top-4 right-2 text-right z-20 max-w-[240px]">
              <p className="font-serif italic text-sm text-brand-dark/90 leading-snug">
                &ldquo;Quality products. Genuine care. For our community.&rdquo;
              </p>
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-accent">
                <span>The Owners</span>
                <Heart className="w-2.5 h-2.5 fill-brand-accent" />
              </div>
            </div>

            {/* The Founders: Integrated with soft organic vignette (Zero box, zero card!) */}
            <div className="relative w-full max-w-[560px] aspect-[16/11]">
              <div
                className="relative w-full h-full"
                style={{
                  maskImage: 'radial-gradient(ellipse 88% 85% at 50% 40%, black 60%, transparent 98%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 88% 85% at 50% 40%, black 60%, transparent 98%)',
                }}
              >
                <Image
                  src={OWNERS_PHOTO}
                  alt="Owners of Chadani Cosmetic, family-owned in Dharan"
                  fill
                  priority
                  sizes="(max-width: 1440px) 45vw, 560px"
                  className="object-cover object-[center_34%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F4ECE1] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-[#8A6A4B]/10 mix-blend-color" />
              </div>
            </div>

            {/* Lower Foreground: Authentic Products on Travertine Counter (No boxes) */}
            <div className="relative w-full -mt-12 z-20">
              <div className="bg-gradient-to-r from-[#E8DFC8] via-[#F2EAE0] to-[#E8DFC8] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E0D5BE]/80 backdrop-blur-xs">
                <div className="grid grid-cols-12 gap-4 items-center">
                  
                  {/* Primary Product Visual: Bangles Showcase */}
                  <div className="col-span-7 flex items-center gap-3.5">
                    <Link href={banglesHref} className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-xs border border-[#D5C9AE] group">
                      <Image
                        src={BANGLES_HERO_IMAGE}
                        alt="Handcrafted Kundan Bangles"
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    </Link>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-brand-accent">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Bangles Showcase</span>
                      </div>
                      <Link href={banglesHref} className="font-serif text-lg sm:text-xl font-medium text-brand-dark hover:text-brand-accent transition-colors block leading-tight">
                        BANGLES
                      </Link>
                      <p className="text-[11px] text-[#6E6157] leading-snug">
                        Traditional &bull; Everyday &bull; Trending
                      </p>
                      <Link href={banglesHref} className="inline-flex items-center gap-1 text-[10px] font-medium tracking-[0.16em] uppercase text-brand-dark hover:text-brand-accent transition-colors pt-0.5">
                        <span>Explore Collection</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Secondary Product Visual: Cosmetics & Skincare */}
                  <div className="col-span-5 flex items-center gap-3 border-l border-[#D5C9AE]/80 pl-4">
                    <Link href={cosmeticsHref} className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden shadow-xs border border-[#D5C9AE] group">
                      <Image
                        src={COSMETICS_HERO_IMAGE}
                        alt="Cosmetics and Skincare Essentials"
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    </Link>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-brand-accent block">
                        Beauty
                      </span>
                      <Link href={cosmeticsHref} className="font-serif text-sm sm:text-base font-medium text-brand-dark hover:text-brand-accent transition-colors block truncate">
                        Cosmetics &amp; Skincare
                      </Link>
                      <Link href={cosmeticsHref} className="inline-flex items-center gap-1 text-[10px] font-medium tracking-[0.14em] uppercase text-[#6E6157] hover:text-brand-dark transition-colors">
                        <span>View All</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM RIBBON: Seamless Terracotta Foundation Band        */}
      {/* ========================================================= */}
      <div className="w-full bg-[#9C6B5B] text-[#FAF5EE] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 border-t border-[#8A5C4E]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          
          {/* Pillar 1: Authentic Products */}
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-white">
                AUTHENTIC PRODUCTS
              </p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">
                Beauty &bull; Bangles &bull; Skincare
              </p>
            </div>
          </div>

          {/* Pillar 2: Bangles for Every Occasion */}
          <div className="flex items-center gap-3 text-left lg:border-l lg:border-white/20 lg:pl-6">
            <Sparkles className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-white">
                BANGLES FOR ALL OCCASIONS
              </p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">
                Traditional &bull; Everyday &bull; Trending
              </p>
            </div>
          </div>

          {/* Pillar 3: Our Community */}
          <div className="flex items-center gap-3 text-left border-t sm:border-t-0 pt-2 sm:pt-0 lg:border-l lg:border-white/20 lg:pl-6">
            <Users className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-white">
                OUR COMMUNITY
              </p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">
                Proudly serving Dharan
              </p>
            </div>
          </div>

          {/* Pillar 4: A Brighter You */}
          <div className="flex items-center gap-3 text-left border-t sm:border-t-0 pt-2 sm:pt-0 lg:border-l lg:border-white/20 lg:pl-6">
            <Heart className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-white">
                A BRIGHTER YOU
              </p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">
                Beauty with genuine care
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
