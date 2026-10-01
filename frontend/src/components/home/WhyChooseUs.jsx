'use client';

import React from 'react';
import { ShieldCheck, MapPin, MessageSquare } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Curated Quality & Authenticity',
    desc: 'Every skincare treatment, cosmetic product, and jewelry piece in our boutique is individually inspected for authenticity and quality.',
  },
  {
    icon: MapPin,
    title: 'Personalized Local Delivery',
    desc: 'Based in Dharan, we coordinate direct doorstep deliveries across all wards, ensuring your orders arrive safely with cash on delivery convenience.',
  },
  {
    icon: MessageSquare,
    title: 'Dedicated Consultation',
    desc: 'Have questions about skin types or product recommendations? Connect with our customer care team via live in-app support chat.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-surface border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
            The Chadani Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
            Our Guiding Commitments
          </h2>
          <p className="text-sm text-brand-muted mt-3 font-normal leading-relaxed">
            Thoughtful curation, dependable local service, and genuine care in every order.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-brand-border/60">
          {VALUES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex flex-col ${idx !== 0 ? 'pt-8 md:pt-0 md:pl-8 lg:pl-12' : ''}`}
              >
                <div className="w-10 h-10 rounded border border-brand-border flex items-center justify-center bg-brand-bg text-brand-dark mb-5">
                  <Icon className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-brand-dark font-medium mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
