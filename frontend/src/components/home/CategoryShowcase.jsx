'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CategoryShowcase({ categories = [] }) {
  return (
    <section id="collections" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c89b8f]">Curated For You</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2a2a2a] mt-3 font-medium">
            Shop By Category
          </h2>
          <p className="text-[#2a2a2a]/55 mt-4 font-light leading-relaxed">
            Discover our handpicked collections — from radiant skincare to timeless jewellery.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((category, i) => (
            <ScrollReveal key={category.id} delay={i * 0.06}>
              <Link href={`/shop?category=${category.id}`} className="block group">
                <motion.div
                  className="relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f7] to-[#f8f8f8]">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#c89b8f]/30 to-[#7a003c]/20" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5a002c]/75 via-[#7a003c]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">Collection</span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium mb-3">{category.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-sm text-white/90 font-light group-hover:gap-2.5 transition-all">
                      Explore
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-4 h-4 text-[#7a003c]" />
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
