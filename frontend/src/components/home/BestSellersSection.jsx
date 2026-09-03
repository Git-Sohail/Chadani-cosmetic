'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import LuxuryProductCard from './LuxuryProductCard';

export default function BestSellersSection({ products = [] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-surface border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 border-b border-brand-border/60 pb-5">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
              Customer Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted hover:text-brand-dark transition-colors group self-start sm:self-end"
          >
            <span>View Full Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id}>
              <LuxuryProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
