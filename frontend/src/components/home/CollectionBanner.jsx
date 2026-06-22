'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=1400';

export default function CollectionBanner() {
  return (
    <section className="section-padding pt-8 sm:pt-10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-[200px] sm:h-[220px] lg:h-[260px] xl:h-[280px]">
            <Image
              src={BANNER_IMAGE}
              alt="Summer beauty collection"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-burgundy-dark/88 via-luxury-burgundy/55 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 max-w-lg">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-luxury-rose-gold mb-2">
                New Season
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-medium leading-tight mb-2">
                Summer Collection
              </h2>
              <p className="text-white/75 text-sm font-light leading-relaxed mb-4 max-w-sm hidden sm:block">
                Luxury skincare for radiant, sun-kissed skin.
              </p>
              <Link href="/shop">
                <motion.span
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-luxury-burgundy text-sm font-medium shadow-md"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
