'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Button from '../Button';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=1200';

export default function CollectionBanner() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-bg border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-brand-surface border border-brand-border p-6 sm:p-10 lg:p-14">
          {/* Left: Editorial Image */}
          <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden bg-brand-bg border border-brand-border">
            <Image
              src={BANNER_IMAGE}
              alt="Chadani Cosmetic Editorial Feature"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 hover:scale-103"
            />
          </div>

          {/* Right: Editorial Narrative */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 lg:pl-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
              Editorial Feature
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal leading-tight tracking-tight">
              Mindfully selected for your daily rituals.
            </h2>

            <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-normal">
              At Chadani Cosmetic, we believe beauty essentials should feel personal, authentic, and reliable. From gentle skincare formulations and pigmented cosmetics to hand-finished traditional jewelry, our catalog brings together items that celebrate your unique expression.
            </p>

            <div className="pt-2">
              <Link href="/shop">
                <Button variant="primary" size="md" className="px-7 py-3 text-xs tracking-[0.16em] uppercase">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
