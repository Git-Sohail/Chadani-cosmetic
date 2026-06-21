'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import LuxuryProductCard from './LuxuryProductCard';

export default function BestSellersSection({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fff5f7]/50">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c89b8f]">Most Loved</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2a2a2a] mt-3 font-medium">Best Sellers</h2>
            <p className="text-[#2a2a2a]/55 mt-3 max-w-md font-light">
              Our community&apos;s favourite picks — elevated essentials that never disappoint.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7a003c] hover:gap-3 transition-all shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.08}>
              <LuxuryProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
