'use client';

import { motion } from 'framer-motion';
import { Leaf, Heart, Stethoscope, Gift, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ITEMS = [
  { icon: Leaf, title: 'Natural Ingredients', desc: 'Pure botanical formulas.' },
  { icon: Heart, title: 'Cruelty Free', desc: 'Never tested on animals.' },
  { icon: Stethoscope, title: 'Dermatologist Approved', desc: 'Clinically tested.' },
  { icon: Gift, title: 'Premium Packaging', desc: 'Luxury unboxing.' },
  { icon: Globe, title: 'Worldwide Shipping', desc: 'Delivered with care.' },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-luxury-rose-gold">The Chadani Promise</span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text mt-2 font-medium">Why Choose Us</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={i * 0.05}>
                <motion.div className="glass-card rounded-2xl p-4 sm:p-5 text-center h-full hover:shadow-md transition-shadow" whileHover={{ y: -3 }}>
                  <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-luxury-pink flex items-center justify-center">
                    <Icon className="w-5 h-5 text-luxury-burgundy" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-sm sm:text-base text-luxury-text mb-1">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-luxury-text/50 font-light">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
