'use client';

import { motion } from 'framer-motion';
import { Leaf, Heart, Stethoscope, Gift, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ITEMS = [
  { icon: Leaf, title: 'Natural Ingredients', desc: 'Pure botanical formulas crafted with care.' },
  { icon: Heart, title: 'Cruelty Free', desc: 'Never tested on animals. Ever.' },
  { icon: Stethoscope, title: 'Dermatologist Approved', desc: 'Clinically tested for all skin types.' },
  { icon: Gift, title: 'Premium Packaging', desc: 'Unboxing experiences worth remembering.' },
  { icon: Globe, title: 'Worldwide Shipping', desc: 'Delivered to your doorstep with love.' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c89b8f]">The Chadani Promise</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2a2a2a] mt-3 font-medium">Why Choose Us</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={i * 0.07}>
                <motion.div
                  className="glass-card rounded-3xl p-6 sm:p-8 text-center h-full hover:shadow-lg transition-shadow duration-500"
                  whileHover={{ y: -4 }}
                >
                  <motion.div
                    className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#fff5f7] flex items-center justify-center"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6 text-[#7a003c]" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-serif text-lg text-[#2a2a2a] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#2a2a2a]/50 font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
