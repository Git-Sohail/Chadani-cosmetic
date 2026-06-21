'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function NewsletterSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden p-8 sm:p-12 lg:p-16 text-center luxury-gradient-bg border border-[#c89b8f]/15 shadow-xl shadow-[#7a003c]/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c89b8f]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <Sparkles className="w-6 h-6 text-[#c89b8f] mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2a2a2a] font-medium mb-3">
                Join the Chadani Beauty Club
              </h2>
              <p className="text-[#2a2a2a]/55 font-light mb-2 max-w-md mx-auto">
                Exclusive offers, beauty tips, and early access to new collections.
              </p>
              <p className="text-sm font-medium text-[#7a003c] mb-8">10% Off Your First Order</p>

              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-full bg-white border border-[#c89b8f]/25 text-[#2a2a2a] placeholder-[#2a2a2a]/35 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a003c]/20 focus:border-[#7a003c]/30"
                />
                <motion.button
                  type="submit"
                  className="px-8 py-4 rounded-full bg-[#7a003c] text-white text-sm font-medium shadow-lg shadow-[#7a003c]/20 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
