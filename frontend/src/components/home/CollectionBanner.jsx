'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=1200';

export default function CollectionBanner() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
            <Image
              src={BANNER_IMAGE}
              alt="Summer beauty collection"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#5a002c]/85 via-[#7a003c]/60 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-center p-8 sm:p-12 lg:p-16 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c89b8f] mb-4">
                New Season
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-medium leading-tight mb-4">
                Summer Collection
              </h2>
              <p className="text-white/75 font-light leading-relaxed mb-8 max-w-md">
                Luxury skincare essentials curated for radiant, sun-kissed skin all season long.
              </p>
              <Link href="/shop">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#7a003c] text-sm font-medium shadow-lg"
                  whileHover={{ scale: 1.03 }}
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
