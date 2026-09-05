'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Sparkles, Heart, ShieldCheck, Users, Truck } from 'lucide-react';

const HERO_EDITORIAL_VISUAL = '/images/hero-editorial-seamless.png';

export default function LuxuryHero({ categories = [] }) {
  // Resolve actual bangles and cosmetics category links from the database
  const banglesCat = categories?.find((c) => /bangle/i.test(c.name));
  const banglesHref = banglesCat ? `/shop?category=${banglesCat.id}` : '/shop?category=Traditional%20Bangles';

  return (
    <section className="relative bg-[#F4EAE0] overflow-hidden">
      {/* Editorial Content & Visual Row */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-6 sm:pb-8 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Semantic Live HTML Typography & CTAs (45%)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 z-10 text-left space-y-4 sm:space-y-6">
            
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#9C6B5B]">
              <span>&mdash; BEAUTY FOR A BRIGHTER YOU &mdash;</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] text-[#241A15] font-normal leading-[1.06] tracking-tight">
              Care That Feels <br className="hidden sm:inline" />
              Like Family
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#615247] max-w-md leading-relaxed font-normal">
              Authentic products, exquisite bangles, and skincare selected with genuine care for our Dharan community.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#241A15] text-[#FAF5EE] text-xs font-medium tracking-[0.16em] uppercase hover:bg-[#9C6B5B] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </Link>

              <Link 
                href={banglesHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.16em] uppercase text-[#241A15] hover:text-[#9C6B5B] transition-colors py-2 group cursor-pointer"
              >
                <span>EXPLORE BANGLES</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-2 text-xs text-[#52443A] pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#9C6B5B] shrink-0" strokeWidth={2} />
              <span className="font-medium text-[#241A15]">Visit us &bull;</span>
              <span>Dharan College Road</span>
            </div>

            {/* Direct Trust Badges */}
            <div className="pt-4 border-t border-[#DECFC0]/80 grid grid-cols-3 gap-2 text-left">
              <div className="space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-[#9C6B5B]" strokeWidth={1.75} />
                <p className="text-[11px] font-medium text-[#241A15] leading-tight pt-1">Trusted Products</p>
                <p className="text-[10px] text-[#78695E]">100% Genuine</p>
              </div>

              <div className="space-y-0.5">
                <Truck className="w-4 h-4 text-[#9C6B5B]" strokeWidth={1.75} />
                <p className="text-[11px] font-medium text-[#241A15] leading-tight pt-1">Dharan Delivery</p>
                <p className="text-[10px] text-[#78695E]">Flat Rs. 100</p>
              </div>

              <div className="space-y-0.5">
                <Sparkles className="w-4 h-4 text-[#9C6B5B]" strokeWidth={1.75} />
                <p className="text-[11px] font-medium text-[#241A15] leading-tight pt-1">Payment</p>
                <p className="text-[10px] text-[#78695E]">Cash on Delivery</p>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Seamless Unboxed Editorial Boutique Visual  */}
          {/* (Zero boxes, zero cards, zero borders, melts into canvas)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[680px] aspect-[674/505]">
              <Image
                src={HERO_EDITORIAL_VISUAL}
                alt="Chadani Cosmetic Founders with luxury cosmetics & skincare boutique counter"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 680px"
                className="object-contain object-right-bottom"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM RIBBON: Seamless Continuous Terracotta Band        */}
      {/* ========================================================= */}
      <div className="w-full bg-[#9C6B5B] text-[#FAF5EE] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 border-t border-[#8A5B4C]">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          
          {/* Pillar 1: Authentic Products */}
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">
                AUTHENTIC BRANDS
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
