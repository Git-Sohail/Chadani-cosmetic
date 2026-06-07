'use client';

import React from 'react';
import Link from 'next/link';
import Button from './Button';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800';

export default function HeroSection({
  title = 'Treat Your Skin With The Best Treatment',
  subtitle = 'Chadani Cosmetic Collections',
  description = 'Discover our exclusive organic skincare remedies, professional beauty cosmetics, and stunning traditional bangles crafted to add elegance to your everyday look.',
  ctaText = 'Explore Collection',
  ctaLink = '/shop',
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-tr from-pink-50 via-rose-100/60 to-pink-150 pb-16 sm:pb-20 lg:pb-28 pt-[calc(var(--nav-height-mobile)+1.5rem)] lg:pt-[calc(var(--nav-height-desktop)+2.5rem)]">
      <div className="absolute top-0 right-0 -z-10 w-72 sm:w-96 h-72 sm:h-96 bg-rose-200/40 rounded-full filter blur-3xl opacity-70 translate-x-16 sm:translate-x-20 -translate-y-16 sm:-translate-y-20 animate-pulse duration-5000" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 sm:w-80 h-64 sm:h-80 bg-pink-200/30 rounded-full filter blur-3xl opacity-60 -translate-x-16 sm:-translate-x-20 translate-y-16 sm:translate-y-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-900/10 text-rose-900 text-xs font-semibold tracking-wider uppercase animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-rose-950 leading-[1.15] tracking-tight">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-rose-900/85 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 sm:pt-4">
              <Link href={ctaLink}>
                <Button variant="primary" size="lg" className="group shadow-lg hover:shadow-xl hover:shadow-rose-900/10">
                  {ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/#collections">
                <Button variant="outline" size="lg">
                  View Catalogue
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-rose-200/50 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-rose-900/80 justify-center lg:justify-start">
                <ShieldCheck className="w-5 h-5 text-rose-700 shrink-0" />
                <span className="text-xs font-semibold">100% Organic & Safe</span>
              </div>
              <div className="flex items-center gap-2 text-rose-900/80 justify-center lg:justify-start">
                <HeartHandshake className="w-5 h-5 text-rose-700 shrink-0" />
                <span className="text-xs font-semibold">Dermatologist Tested</span>
              </div>
              <div className="flex items-center gap-2 text-rose-900/80 justify-center lg:justify-start sm:col-span-1 col-span-1">
                <Sparkles className="w-5 h-5 text-rose-700 shrink-0" />
                <span className="text-xs font-semibold">Premium Craft</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 mt-2 sm:mt-0">
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px] xl:w-[500px] xl:h-[500px] shrink-0">
              <div className="absolute inset-0 border-2 border-dashed border-rose-300 rounded-full animate-spin-slow opacity-60 pointer-events-none" />
              <div className="absolute inset-3 sm:inset-4 overflow-hidden rounded-full border-[6px] sm:border-[8px] border-white bg-pink-100 shadow-2xl group">
                <img
                  src={HERO_IMAGE}
                  alt="Beauty and cosmetics collection"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute top-0 left-0 sm:-top-2 sm:-left-2 bg-white text-rose-900 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md border border-pink-100 flex items-center gap-1.5">
                <span>✨</span> Beauty
              </div>
              <div className="absolute bottom-4 sm:bottom-6 -right-1 sm:-right-2 bg-rose-900 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <span>💖</span> Premium
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
