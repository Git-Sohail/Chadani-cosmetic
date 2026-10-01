'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="relative overflow-hidden py-0 bg-brand-bg">
      {/* Full-bleed warm terracotta band */}
      <motion.div
        className="relative bg-[#9C6B5B] py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        {/* Subtle warm texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #FFF 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FFF 0%, transparent 40%)',
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#F5EAE0]/70" strokeWidth={1.5} />
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#F5EAE0]/80">
                The Journal &amp; Releases
              </span>
              <Sparkles className="w-4 h-4 text-[#F5EAE0]/70" strokeWidth={1.5} />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FAF5EE] font-normal tracking-tight mb-3">
              Join the Chadani Circle
            </h2>

            <p className="text-sm text-[#F5EAE0]/80 max-w-md mx-auto leading-relaxed font-normal mb-8">
              Receive updates on seasonal arrivals, curated skincare advice, and restocks directly in your inbox.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-6 py-4 bg-[#FAF5EE]/15 border border-[#FAF5EE]/30 text-sm text-[#FAF5EE] font-medium backdrop-blur-xs">
                ✓&ensp;You&rsquo;re subscribed — thank you!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 bg-[#FAF5EE]/15 border border-[#FAF5EE]/30 text-xs text-[#FAF5EE] placeholder:text-[#F5EAE0]/50 focus:outline-none focus:border-[#FAF5EE]/70 focus:bg-[#FAF5EE]/20 transition-colors"
                />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#FAF5EE] text-[#241A15] text-xs font-medium uppercase tracking-[0.18em] hover:bg-white transition-colors cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] text-[#F5EAE0]/50 mt-4">
              We value your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
