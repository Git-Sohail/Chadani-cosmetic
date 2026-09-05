'use client';

import React from 'react';
import { Sparkles, Heart, Truck, Store } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Sparkles,
    label: 'Bangles for Every Occasion',
  },
  {
    icon: Heart,
    label: 'Beauty & Skincare',
  },
  {
    icon: Truck,
    label: 'Dharan Delivery · Flat Rs. 100',
  },
  {
    icon: Store,
    label: 'Family-Owned in Dharan',
  },
];

export default function FeatureBar() {
  return (
    <section className="bg-brand-surface border-y border-brand-border/70 py-3 sm:py-3.5">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-center">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-center sm:justify-start lg:justify-center gap-2 text-center sm:text-left ${
                  index !== TRUST_ITEMS.length - 1 ? 'md:border-r md:border-brand-border/60' : ''
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-brand-accent shrink-0" strokeWidth={1.75} />
                <span className="text-[11px] sm:text-xs font-medium text-brand-dark tracking-wide">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
