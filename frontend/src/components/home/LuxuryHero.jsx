'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Leaf,
  Truck,
  Banknote,
  Sparkles,
  Heart,
  ShieldCheck,
  Users,
} from 'lucide-react';

const HERO_EDITORIAL_SCENE = '/images/hero-editorial-seamless.png';

export default function LuxuryHero({ categories = [] }) {
  // Resolve actual bangles category link from catalog
  const banglesCat = categories?.find((c) => /bangle/i.test(c.name));
  const banglesHref = banglesCat
    ? `/shop?category=${banglesCat.id}`
    : '/shop?category=Traditional%20Bangles';

  return (
    <section className="relative w-full bg-[#F4ECE1] overflow-hidden">
      {/* ========================================================= */}
      {/* MAIN HERO CANVAS (Continuous Editorial Scene)             */}
      {/* Desktop target height: ~650px - 700px                     */}
      {/* ========================================================= */}
      <div className="relative w-full min-h-[580px] lg:min-h-[660px] xl:min-h-[700px] flex items-center">
        
        {/* Warm Cream / Travertine Ambient Environment */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F2] via-[#F4ECE1] to-[#E9DFCF] pointer-events-none" />

        {/* Grounding Countertop Ledge: Extends across entire lower portion */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[64px] sm:h-[80px] lg:h-[95px] bg-gradient-to-b from-[#EFE5D7] via-[#E4D9C7] to-[#D8CCB9] border-t border-[#DECFC0]/80 z-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle stone top highlight line */}
          <div className="absolute top-0 inset-x-0 h-px bg-white/50" />
        </div>

        {/* ========================================================= */}
        {/* DESKTOP BACKGROUND SCENE: Owners + Countertop Products     */}
        {/* (Integrated naturally with feathered edge, zero card)     */}
        {/* ========================================================= */}
        <div 
          className="hidden lg:flex absolute right-0 bottom-0 top-0 w-[64%] xl:w-[62%] 2xl:w-[60%] pointer-events-none items-end justify-end z-1"
          aria-hidden="true"
        >
          <div className="relative w-full h-full max-h-[680px] xl:max-h-[720px]">
            <Image
              src={HERO_EDITORIAL_SCENE}
              alt="Chadani Cosmetic founders in Dharan boutique with beauty & cosmetics counter"
              fill
              priority
              sizes="(max-width: 1440px) 64vw, 900px"
              className="object-contain object-right-bottom select-none"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOREGROUND CONTENT LAYER: Semantic HTML / CSS (Left 35%)  */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-14">
          <div className="max-w-[480px] lg:max-w-[440px] xl:max-w-[490px] space-y-4 sm:space-y-5 text-left">
            
            {/* 1. Brand Identity & Eyebrow */}
            <div className="space-y-1">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.16em] text-[#241A15] block uppercase font-medium leading-none">
                CHADANI
              </span>
              <span className="font-sans text-[11px] sm:text-xs tracking-[0.28em] text-[#6E5D52] block uppercase font-medium">
                COSMETIC
              </span>
              <div className="pt-2 text-[10px] sm:text-[11px] font-mono tracking-[0.24em] uppercase text-[#9C6B5B]">
                &mdash; BEAUTY FOR A BRIGHTER YOU &mdash;
              </div>
            </div>

            {/* 2. Main Editorial Headline (Cormorant Garamond) */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] text-[#241A15] font-normal leading-[1.04] tracking-tight">
              Beauty, Bangles <br />
              &amp; More
            </h1>

            {/* 3. Supporting Copy */}
            <p className="text-sm sm:text-base text-[#615247] max-w-[420px] leading-relaxed font-normal">
              Beautiful bangles, cosmetics and skincare selected with genuine care for our community.
            </p>

            {/* 4. Action Buttons (Pill button + understated link, NO box container) */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1 sm:pt-2">
              <Link href="/shop">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#241A15] text-[#FAF5EE] text-xs font-medium tracking-[0.18em] uppercase hover:bg-[#9C6B5B] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </Link>

              <Link 
                href={banglesHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] uppercase text-[#241A15] hover:text-[#9C6B5B] transition-colors py-2 group cursor-pointer"
              >
                <span>EXPLORE BANGLES</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 5. Direct Trust Icons (Placed directly on background like reference, NO cards) */}
            <div className="pt-3 sm:pt-4 border-t border-[#DECFC0]/80 grid grid-cols-3 gap-2 sm:gap-4 max-w-[420px]">
              {/* Leaf: Trusted Products */}
              <div className="space-y-1">
                <Leaf className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Trusted<br />Products
                </p>
              </div>

              {/* Truck: Dharan Delivery Flat Rs. 100 */}
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Dharan Delivery<br />Flat Rs. 100
                </p>
              </div>

              {/* Banknote: Cash on Delivery */}
              <div className="space-y-1">
                <Banknote className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Cash on<br />Delivery
                </p>
              </div>
            </div>

            {/* 6. Location Line */}
            <div className="flex items-center gap-2 text-xs text-[#615247] pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#9C6B5B] shrink-0" strokeWidth={2} />
              <span className="font-medium text-[#241A15]">Visit us &bull;</span>
              <span>Dharan College Road</span>
            </div>

            {/* ========================================================= */}
            {/* MOBILE ONLY: Natural Unboxed Visual Flow                  */}
            {/* ========================================================= */}
            <div className="block lg:hidden pt-4 space-y-3">
              <div className="relative w-full aspect-[674/505] max-w-[480px] mx-auto">
                <Image
                  src={HERO_EDITORIAL_SCENE}
                  alt="Chadani Cosmetic Founders and boutique beauty collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* BOTTOM RIBBON: Seamless Continuous Terracotta Foundation  */}
      {/* Attaches directly to the hero canvas, spanning 100% width */}
      {/* ========================================================= */}
      <div className="w-full bg-[#9C6B5B] text-[#FAF5EE] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 border-t border-[#8A5B4C]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          
          {/* Pillar 1: Authentic Products */}
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">
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
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">
                BANGLES FOR EVERY OCCASION
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
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">
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
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">
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
