'use client';

import React from 'react';
import { Sparkles, MapPin, Banknote, MessageCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Verified Authentic',
    desc: '100% genuine cosmetics & jewelry curated with care',
  },
  {
    icon: MapPin,
    title: 'Dharan Local Delivery',
    desc: 'Doorstep delivery across all wards (Flat Rs. 100)',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    desc: 'Convenient and secure payment at your doorstep',
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Support',
    desc: 'Direct consultation through our in-app chat',
  },
];

export default function FeatureBar() {
  return (
    <section className="bg-brand-surface border-b border-brand-border/60 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded border border-brand-border flex items-center justify-center bg-brand-bg text-brand-dark">
                  <Icon className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm sm:text-base text-brand-dark font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
