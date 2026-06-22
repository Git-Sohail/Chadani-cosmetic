'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CategoryShowcase({ categories = [] }) {
  return (
    <section id="collections" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-luxury-rose-gold">Curated For You</span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text mt-2 font-medium">
            Shop By Category
          </h2>
          <p className="text-luxury-text/55 mt-2 text-sm font-light">
            From radiant skincare to timeless jewellery.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category, i) => (
            <ScrollReveal key={category.id} delay={i * 0.05}>
              <Link href={`/shop?category=${category.id}`} className="block group">
                <motion.div
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-luxury-pink">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-luxury-rose-gold/25 to-luxury-burgundy/15" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-burgundy-dark/80 via-luxury-burgundy/15 to-transparent" />
                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                    <h3 className="font-serif text-lg sm:text-xl text-white font-medium">{category.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-white/85 font-light mt-1 group-hover:gap-2 transition-all">
                      Explore <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
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
