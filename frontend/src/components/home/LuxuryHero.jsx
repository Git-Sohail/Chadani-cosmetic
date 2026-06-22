'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=900';

const FLOATING_BADGES = [
  { label: 'Organic', style: 'top-[6%] left-[4%]' },
  { label: 'Cruelty Free', style: 'top-[18%] right-[2%]' },
  { label: 'Best Seller', style: 'bottom-[14%] right-[6%]' },
];

export default function LuxuryHero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 22 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative luxury-gradient-bg overflow-hidden pt-4 pb-10 sm:pb-12 lg:pb-14">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -right-[8%] w-72 h-72 rounded-full bg-luxury-rose-gold/12 blur-[70px]" />
        <div className="absolute bottom-[10%] -left-[5%] w-56 h-56 rounded-full bg-luxury-burgundy/6 blur-[60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center min-h-0 lg:min-h-[480px]">
          <motion.div
            className="space-y-5 text-center lg:text-left order-1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-burgundy">
              <Sparkles className="w-3 h-3 text-luxury-rose-gold" />
              Luxury Organic Beauty
            </div>

            <h1 className="font-serif text-[2rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-medium text-luxury-text leading-[1.1] tracking-tight">
              Reveal Your
              <span className="block text-luxury-burgundy italic">Natural Glow</span>
              <span className="block text-lg sm:text-xl lg:text-2xl font-normal text-luxury-text/70 mt-1.5 not-italic font-sans">
                with Premium Beauty Essentials
              </span>
            </h1>

            <p className="text-sm sm:text-base text-luxury-text/60 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
              Curated skincare, luxury cosmetics, and artisan jewellery for the modern woman.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link href="/shop" className="w-full sm:w-auto">
                <motion.span
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-luxury-burgundy text-white text-sm font-medium shadow-md shadow-luxury-burgundy/15"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/shop?category=skincare" className="w-full sm:w-auto">
                <motion.span
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-luxury-rose-gold/40 text-luxury-burgundy text-sm font-medium bg-white/70 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Skincare
                </motion.span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 pt-2">
              <div className="flex items-center gap-0.5 text-luxury-rose-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-luxury-text/55 font-light">
                Trusted by <span className="font-medium text-luxury-burgundy">15,000+</span> Beauty Lovers
              </p>
            </div>
          </motion.div>

          <div
            ref={containerRef}
            className="relative flex justify-center lg:justify-end order-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="relative w-full max-w-[420px] sm:max-w-[460px] aspect-[4/5] sm:aspect-square"
              style={{ rotateY, rotateX, transformPerspective: 1000 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-[6%] rounded-full bg-luxury-rose-gold/15 blur-2xl" />
              <div className="absolute inset-[10%] rounded-3xl overflow-hidden shadow-xl shadow-luxury-burgundy/10 ring-1 ring-white/90">
                <Image
                  src={HERO_IMAGE}
                  alt="Premium beauty collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 460px"
                  className="object-cover object-center"
                />
              </div>

              {FLOATING_BADGES.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  className={`absolute ${badge.style} z-10`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                >
                  <span className="glass-card px-3 py-1.5 rounded-full text-[10px] font-medium text-luxury-burgundy whitespace-nowrap">
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
