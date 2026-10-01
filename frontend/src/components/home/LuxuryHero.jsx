'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Leaf,
  Truck,
  Banknote,
  Sparkles,
  Heart,
  ShieldCheck,
  Users,
} from 'lucide-react';

const HERO_EDITORIAL_SCENE = '/images/hero-editorial-seamless.png';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 },
  }),
};

export default function LuxuryHero({ categories = [] }) {
  const banglesCat = categories?.find((c) => /bangle/i.test(c.name));
  const banglesHref = banglesCat
    ? `/shop?category=${banglesCat.id}`
    : '/shop?category=Traditional%20Bangles';

  return (
    <section className="relative w-full bg-[#F4ECE1] overflow-hidden">
      {/* MAIN HERO CANVAS */}
      <div className="relative w-full min-h-[580px] lg:min-h-[660px] xl:min-h-[700px] flex items-center">

        {/* Warm Cream Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F2] via-[#F4ECE1] to-[#E9DFCF] pointer-events-none" />

        {/* Subtle botanical shadow — top-right atmosphere */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full opacity-[0.04] pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse at 80% 20%, #5C3D2A 0%, transparent 65%)',
          }}
        />

        {/* Grounding Countertop Ledge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[64px] sm:h-[80px] lg:h-[95px] bg-gradient-to-b from-[#EFE5D7] via-[#E4D9C7] to-[#D8CCB9] border-t border-[#DECFC0]/80 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/50" />
        </div>

        {/* DESKTOP EDITORIAL SCENE */}
        <div
          className="hidden lg:flex absolute right-0 bottom-0 top-0 w-[64%] xl:w-[62%] 2xl:w-[60%] pointer-events-none items-end justify-end z-1"
          aria-hidden="true"
        >
          <motion.div
            className="relative w-full h-full max-h-[680px] xl:max-h-[720px]"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={HERO_EDITORIAL_SCENE}
              alt="Chadani Cosmetic founders in Dharan boutique with beauty & cosmetics counter"
              fill
              priority
              sizes="(max-width: 1440px) 64vw, 900px"
              className="object-contain object-right-bottom select-none"
            />
          </motion.div>
        </div>

        {/* FOREGROUND CONTENT */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-14">
          <div className="max-w-[480px] lg:max-w-[440px] xl:max-w-[490px] space-y-4 sm:space-y-5 text-left">

            {/* 1. Brand Identity & Eyebrow */}
            <motion.div
              className="space-y-1"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.16em] text-[#241A15] block uppercase font-medium leading-none">
                CHADANI
              </span>
              <span className="font-sans text-[11px] sm:text-xs tracking-[0.28em] text-[#6E5D52] block uppercase font-medium">
                COSMETIC
              </span>
              <div className="pt-2 text-[10px] sm:text-[11px] font-mono tracking-[0.24em] uppercase text-[#9C6B5B]">
                &mdash; BEAUTY FOR A BRIGHTER YOU &mdash;
              </div>
            </motion.div>

            {/* 2. Main Headline */}
            <motion.h1
              className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] text-[#241A15] font-normal leading-[1.04] tracking-tight"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
            >
              Beauty, Bangles <br />
              &amp; More
            </motion.h1>

            {/* 3. Supporting Copy */}
            <motion.p
              className="text-sm sm:text-base text-[#615247] max-w-[420px] leading-relaxed font-normal"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
            >
              Beautiful bangles, cosmetics and skincare selected with genuine care for our community.
            </motion.p>

            {/* 4. Action Buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1 sm:pt-2"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <Link href="/shop">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#241A15] text-[#FAF5EE] text-xs font-medium tracking-[0.18em] uppercase hover:bg-[#9C6B5B] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </Link>

              <Link
                href={banglesHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] uppercase text-[#241A15] hover:text-[#9C6B5B] transition-colors py-2 group cursor-pointer"
              >
                <span>EXPLORE BANGLES</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* 5. Trust Icons */}
            <motion.div
              className="pt-3 sm:pt-4 border-t border-[#DECFC0]/80 grid grid-cols-3 gap-2 sm:gap-4 max-w-[420px]"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
            >
              <div className="space-y-1">
                <Leaf className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Trusted<br />Products
                </p>
              </div>
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Dharan Delivery<br />Flat Rs. 100
                </p>
              </div>
              <div className="space-y-1">
                <Banknote className="w-4 h-4 text-[#241A15]" strokeWidth={1.5} />
                <p className="text-[11px] sm:text-xs text-[#241A15] font-medium leading-tight">
                  Cash on<br />Delivery
                </p>
              </div>
            </motion.div>

            {/* 6. Location Line */}
            <motion.div
              className="flex items-center gap-2 text-xs text-[#615247] pt-1"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
            >
              <MapPin className="w-3.5 h-3.5 text-[#9C6B5B] shrink-0" strokeWidth={2} />
              <span className="font-medium text-[#241A15]">Visit us &bull;</span>
              <span>Dharan College Road</span>
            </motion.div>

            {/* MOBILE ONLY: Scene image */}
            <div className="block lg:hidden pt-4 space-y-3">
              <motion.div
                className="relative w-full aspect-[674/505] max-w-[480px] mx-auto"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
              >
                <Image
                  src={HERO_EDITORIAL_SCENE}
                  alt="Chadani Cosmetic Founders and boutique beauty collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-contain object-bottom"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM TERRACOTTA RIBBON */}
      <div className="w-full bg-[#9C6B5B] text-[#FAF5EE] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 border-t border-[#8A5B4C]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">AUTHENTIC PRODUCTS</p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">Beauty &bull; Bangles &bull; Skincare</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left lg:border-l lg:border-white/20 lg:pl-6">
            <Sparkles className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">BANGLES FOR EVERY OCCASION</p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">Traditional &bull; Everyday &bull; Trending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left border-t sm:border-t-0 pt-2 sm:pt-0 lg:border-l lg:border-white/20 lg:pl-6">
            <Users className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">OUR COMMUNITY</p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">Proudly serving Dharan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left border-t sm:border-t-0 pt-2 sm:pt-0 lg:border-l lg:border-white/20 lg:pl-6">
            <Heart className="w-4 h-4 text-[#F5EAE0] shrink-0 opacity-90" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white">A BRIGHTER YOU</p>
              <p className="text-[10px] text-[#F0E4D8]/80 leading-tight">Beauty with genuine care</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
