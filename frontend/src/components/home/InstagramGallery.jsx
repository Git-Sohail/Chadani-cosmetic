'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const LOOKBOOK_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=700',
    title: 'Radiant Glow',
    tag: 'Skincare',
    href: '/shop?category=skincare',
  },
  {
    src: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=700',
    title: 'Warm Palettes',
    tag: 'Cosmetics',
    href: '/shop?category=cosmetics',
  },
  {
    src: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=700',
    title: 'Natural Hydration',
    tag: 'Treatments',
    href: '/shop',
  },
  {
    src: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=700',
    title: 'Classic Accents',
    tag: 'Accessories',
    href: '/shop?category=bangles',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function InstagramGallery() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-surface border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-xl mx-auto mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
            Visual Journal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
            The Aesthetic Lookbook
          </h2>
          <p className="text-sm text-brand-muted mt-2 font-normal leading-relaxed">
            A visual reflection of timeless beauty rituals and everyday luxury.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {LOOKBOOK_ITEMS.map((item) => (
            <motion.div key={item.title} variants={itemVariants}>
              <Link
                href={item.href}
                className="group relative aspect-[3/4] overflow-hidden bg-brand-bg border border-brand-border block"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Always-visible subtle bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent" />

                {/* Text — always visible at bottom */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-white">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-surface/75 block mb-0.5">
                    {item.tag}
                  </span>
                  <p className="font-serif text-sm sm:text-base leading-tight">{item.title}</p>
                </div>

                {/* Hover reveal arrow */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-surface/20 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
