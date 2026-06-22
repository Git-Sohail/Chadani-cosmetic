'use client';

import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FEATURES = [
  { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine luxury products' },
  { icon: Truck, title: 'Free Delivery', desc: 'Orders above Rs. 2000' },
  { icon: CreditCard, title: 'Secure Payment', desc: 'Encrypted checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free policy' },
];

export default function FeatureBar() {
  return (
    <section className="relative z-10 -mt-4 px-4 sm:px-6 lg:px-8 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:shadow-md transition-shadow duration-300 group">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-luxury-pink flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-luxury-burgundy" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[11px] sm:text-xs font-medium text-luxury-text">{item.title}</h3>
                  <p className="text-[10px] text-luxury-text/45 font-light hidden sm:block mt-0.5">{item.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
