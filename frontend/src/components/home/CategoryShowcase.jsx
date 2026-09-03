'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryShowcase({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section id="collections" className="py-16 sm:py-20 lg:py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 border-b border-brand-border/60 pb-5">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
              Curated Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted hover:text-brand-dark transition-colors group self-start sm:self-end"
          >
            <span>View All Products</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group block relative"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-surface border border-brand-border/80">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-surface text-brand-muted/40 font-serif text-2xl italic">
                    {category.name}
                  </div>
                )}
                {/* Subtle dark gradient scrim at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />

                {/* Editorial text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between text-brand-surface">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-surface/75 block mb-1">
                      Department
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-surface/20 text-white backdrop-blur-xs group-hover:bg-white group-hover:text-brand-dark transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
