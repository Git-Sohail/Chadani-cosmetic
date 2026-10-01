'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Heart } from 'lucide-react';
import Button from '../Button';

// Use the local founders/boutique image as the editorial brand story image
const FOUNDERS_IMAGE = '/images/chadani-owners-original.jpg';

export default function CollectionBanner() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-bg border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-stretch">

          {/* Left: Editorial Image */}
          <motion.div
            className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[500px] overflow-hidden bg-brand-bg"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={FOUNDERS_IMAGE}
              alt="Chadani Cosmetic — our founders and the heart of the boutique"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
            {/* Subtle bottom gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent" />

            {/* Floating label */}
            <div className="absolute bottom-5 left-5 px-3 py-2 bg-brand-surface/90 backdrop-blur-sm border border-brand-border/60">
              <span className="text-[10px] uppercase tracking-[0.22em] text-brand-muted font-medium block">
                Dharan, Nepal
              </span>
              <span className="font-serif text-sm text-brand-dark">
                Since 2018
              </span>
            </div>
          </motion.div>

          {/* Right: Brand Story */}
          <motion.div
            className="lg:col-span-6 space-y-6 sm:space-y-7 lg:pl-14 xl:pl-16 flex flex-col justify-center py-4 lg:py-0"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
              Our Story
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal leading-tight tracking-tight">
              Mindfully selected<br className="hidden lg:block" /> for your daily rituals.
            </h2>

            <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-normal">
              At Chadani Cosmetic, we believe beauty essentials should feel personal, authentic, and reliable. From gentle skincare formulations and pigmented cosmetics to hand-finished traditional bangles, our catalog celebrates your unique expression.
            </p>

            {/* Values micro-list */}
            <div className="space-y-3 pt-1">
              {[
                { icon: Leaf, text: 'Personally curated, quality-checked products' },
                { icon: Heart, text: 'Family boutique serving Dharan with care' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center bg-brand-bg shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-accent" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-brand-muted leading-relaxed pt-1">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="/shop">
                <Button variant="primary" size="md" className="px-7 py-3 text-xs tracking-[0.16em] uppercase">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
