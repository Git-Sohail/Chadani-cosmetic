'use client';

import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FEATURES = [
  { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine luxury products' },
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above Rs. 2000' },
  { icon: CreditCard, title: 'Secure Payment', desc: 'Encrypted checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free policy' },
];

export default function FeatureBar() {
  return (
    <section className="relative z-10 -mt-6 sm:-mt-10 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center hover:shadow-lg hover:shadow-[#7a003c]/8 transition-shadow duration-500 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-[#fff5f7] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a003c]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#2a2a2a] mb-1">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-[#2a2a2a]/50 font-light hidden sm:block">{item.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
