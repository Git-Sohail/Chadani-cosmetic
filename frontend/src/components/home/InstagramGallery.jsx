'use client';

import React from 'react';
import Image from 'next/image';

const LOOKBOOK_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=700',
    title: 'Radiant Glow',
    tag: 'Skincare',
  },
  {
    src: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=700',
    title: 'Warm Palettes',
    tag: 'Cosmetics',
  },
  {
    src: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=700',
    title: 'Natural Hydration',
    tag: 'Treatments',
  },
  {
    src: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=700',
    title: 'Classic Accents',
    tag: 'Accessories',
  },
];

export default function InstagramGallery() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-surface border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
            Visual Journal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
            The Aesthetic Lookbook
          </h2>
          <p className="text-sm text-brand-muted mt-2 font-normal leading-relaxed">
            A visual reflection of timeless beauty rituals and everyday luxury.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {LOOKBOOK_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative aspect-[3/4] overflow-hidden bg-brand-bg border border-brand-border"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-surface/80">
                  {item.tag}
                </span>
                <p className="font-serif text-sm sm:text-base">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
