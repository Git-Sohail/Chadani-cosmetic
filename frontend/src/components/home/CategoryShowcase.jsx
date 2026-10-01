'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function CategoryShowcase({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  // Prioritize Bangles as the primary business category
  const sortedCategories = [...categories].sort((a, b) => {
    const aIsBangle = /bangle/i.test(a.name);
    const bIsBangle = /bangle/i.test(b.name);
    if (aIsBangle && !bIsBangle) return -1;
    if (!aIsBangle && bIsBangle) return 1;
    return 0;
  });

  return (
    <section id="collections" className="py-14 sm:py-18 lg:py-20 bg-brand-bg">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 border-b border-brand-border/60 pb-4"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1.5">
              Curated Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted hover:text-brand-dark transition-colors group self-start sm:self-end"
          >
            <span>View All Products</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {/* Category Grid — staggered */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {sortedCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                href={`/shop?category=${category.id}`}
                className="group block relative"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-surface border border-brand-border/80">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-surface text-brand-muted/40 font-serif text-2xl italic">
                      {category.name}
                    </div>
                  )}
                  {/* Gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/15 to-transparent" />

                  {/* Hover reveal tint */}
                  <div className="absolute inset-0 bg-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Editorial text overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between text-brand-surface">
                    <div>
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-surface/65 block mb-1">
                        Department
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-tight">
                        {category.name}
                      </h3>
                      {category._count?.products != null && (
                        <span className="text-[10px] text-brand-surface/60 mt-0.5 block">
                          {category._count.products} products
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-surface/20 text-white backdrop-blur-xs group-hover:bg-white group-hover:text-brand-dark transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
