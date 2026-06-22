'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function NewsletterSection() {
  return (
    <section className="section-padding pt-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-10 text-center luxury-gradient-bg border border-luxury-rose-gold/15 shadow-md">
            <Sparkles className="w-5 h-5 text-luxury-rose-gold mx-auto mb-3" />
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-luxury-text font-medium mb-2">
              Join the Chadani Beauty Club
            </h2>
            <p className="text-luxury-text/55 text-sm font-light mb-1">Exclusive offers and early access.</p>
            <p className="text-sm font-medium text-luxury-burgundy mb-6">10% Off Your First Order</p>

            <form className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full bg-white border border-luxury-rose-gold/25 text-luxury-text placeholder-luxury-text/35 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-burgundy/15"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 rounded-full bg-luxury-burgundy text-white text-sm font-medium cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
