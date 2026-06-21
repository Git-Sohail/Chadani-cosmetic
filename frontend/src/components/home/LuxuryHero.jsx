'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=900';

const FLOATING_BADGES = [
  { label: 'Organic', style: 'top-[8%] left-[2%] sm:left-[5%]' },
  { label: 'Cruelty Free', style: 'top-[22%] right-0 sm:right-[2%]' },
  { label: 'Premium Quality', style: 'bottom-[28%] left-0 sm:left-[2%]' },
  { label: 'Best Seller', style: 'bottom-[12%] right-[2%] sm:right-[8%]' },
  { label: 'Dermatologist Tested', style: 'top-[48%] right-[0%] sm:right-[-2%]' },
];

export default function LuxuryHero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen luxury-gradient-bg overflow-hidden pt-8 lg:pt-12 pb-16 lg:pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -right-[10%] w-[50vw] max-w-xl h-[50vw] max-h-xl rounded-full bg-[#c89b8f]/15 blur-[80px]" />
        <div className="absolute bottom-[5%] -left-[5%] w-[40vw] max-w-md h-[40vw] max-h-md rounded-full bg-[#7a003c]/8 blur-[70px]" />
        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c89b8f]/40"
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 11) % 90}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-10 lg:gap-6 items-center min-h-[calc(90vh-var(--nav-height-desktop)-4rem)]">
          <motion.div
            className="space-y-6 sm:space-y-8 text-center lg:text-left order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a003c]">
              <Sparkles className="w-3.5 h-3.5 text-[#c89b8f]" />
              Luxury Organic Beauty
            </div>

            <h1 className="font-serif text-[2.25rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-medium text-[#2a2a2a] leading-[1.08] tracking-tight">
              Reveal Your
              <span className="block text-[#7a003c] italic">Natural Glow</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-[#2a2a2a]/75 mt-2 not-italic">
                with Premium Beauty Essentials
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#2a2a2a]/65 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              Curated skincare, luxury cosmetics, and artisan jewellery — crafted for the modern woman who deserves nothing but the finest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/shop" className="w-full sm:w-auto">
                <motion.span
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#7a003c] text-white text-sm font-medium tracking-wide shadow-lg shadow-[#7a003c]/20"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/shop?category=skincare" className="w-full sm:w-auto">
                <motion.span
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#c89b8f]/50 text-[#7a003c] text-sm font-medium tracking-wide bg-white/60 backdrop-blur-sm"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.9)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Skincare
                </motion.span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <div className="flex items-center gap-0.5 text-[#c89b8f]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#2a2a2a]/60 font-light">
                Trusted by <span className="font-medium text-[#7a003c]">15,000+</span> Beauty Lovers
              </p>
            </div>
          </motion.div>

          <div
            ref={containerRef}
            className="relative flex justify-center lg:justify-end order-2 min-h-[380px] sm:min-h-[440px] lg:min-h-[520px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="relative w-full max-w-[520px] aspect-square"
              style={{ rotateY, rotateX, transformPerspective: 1200 }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-[#c89b8f]/20 to-[#7a003c]/10 blur-2xl" />
              <div className="absolute inset-[12%] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#7a003c]/15 ring-1 ring-white/80">
                <Image
                  src={HERO_IMAGE}
                  alt="Premium beauty collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover object-center"
                />
              </div>

              {FLOATING_BADGES.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  className={`absolute ${badge.style} z-10`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.5 + i * 0.1, duration: 0.5 },
                    scale: { delay: 0.5 + i * 0.1, duration: 0.5 },
                    y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 },
                  }}
                >
                  <span className="glass-card px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium text-[#7a003c] whitespace-nowrap shadow-sm">
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
