'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import LuxuryProductCard from './LuxuryProductCard';

export default function BestSellersSection({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="section-padding bg-luxury-pink/60">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-luxury-rose-gold">Most Loved</span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text mt-2 font-medium">Best Sellers</h2>
            <p className="text-luxury-text/55 mt-2 text-sm font-light max-w-md">
              Elevated essentials our community loves.
            </p>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-luxury-burgundy hover:gap-2.5 transition-all shrink-0">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.06}>
              <LuxuryProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
