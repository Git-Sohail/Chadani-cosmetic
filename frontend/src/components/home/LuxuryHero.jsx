'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Button from '../Button';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=1000';

export default function LuxuryHero() {
  return (
    <section className="relative bg-brand-bg pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 border-b border-brand-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column — Editorial Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent">
              <span>Chadani Cosmetic</span>
              <span>&bull;</span>
              <span>Boutique Beauty & Cosmetics</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brand-dark font-normal leading-[1.1] tracking-tight">
              Curated beauty,{' '}
              <span className="italic block sm:inline">artfully refined.</span>
            </h1>

            <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Explore authentic skincare treatments, everyday cosmetic essentials, and handpicked jewelry designed to enhance your natural grace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3.5 tracking-[0.14em] uppercase text-xs">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
              <Link href="/shop?category=skincare" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-7 py-3.5 tracking-[0.14em] uppercase text-xs">
                  <span>Shop Skincare</span>
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-brand-muted/80">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Dharan Delivery (Flat Rs. 100)
              </span>
              <span>&bull;</span>
              <span>Cash on Delivery</span>
              <span>&bull;</span>
              <span>Verified Authentic</span>
            </div>
          </div>

          {/* Right Column — Editorial Photography Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] bg-brand-surface p-3 border border-brand-border shadow-xs">
              <div className="relative w-full h-full overflow-hidden bg-brand-bg">
                <Image
                  src={HERO_IMAGE}
                  alt="Chadani Cosmetic Editorial Campaign"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 440px"
                  className="object-cover object-center transition-transform duration-700 hover:scale-103"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-brand-surface/95 backdrop-blur-sm px-4 py-2.5 border border-brand-border flex items-center justify-between text-[11px] text-brand-dark uppercase tracking-[0.18em]">
                <span>Signature Curation</span>
                <span className="text-brand-accent font-serif italic capitalize tracking-normal text-xs">2026 Edition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
