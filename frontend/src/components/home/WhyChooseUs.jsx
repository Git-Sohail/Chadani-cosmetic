'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, MessageSquare } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Curated Quality & Authenticity',
    desc: 'Every skincare treatment, cosmetic product, and jewelry piece in our boutique is individually inspected for authenticity and quality.',
  },
  {
    icon: MapPin,
    title: 'Personalized Local Delivery',
    desc: 'Based in Dharan, we coordinate direct doorstep deliveries across all wards, ensuring your orders arrive safely with cash on delivery convenience.',
  },
  {
    icon: MessageSquare,
    title: 'Dedicated Consultation',
    desc: 'Have questions about skin types or product recommendations? Connect with our customer care team via live in-app support chat.',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-surface border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
            The Chadani Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
            Our Guiding Commitments
          </h2>
          <p className="text-sm text-brand-muted mt-3 font-normal leading-relaxed">
            Thoughtful curation, dependable local service, and genuine care in every order.
          </p>
        </motion.div>

        {/* 3 Pillars Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-brand-border/60"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {VALUES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={`flex flex-col ${idx !== 0 ? 'pt-8 md:pt-0 md:pl-8 lg:pl-12' : ''}`}
              >
                <div className="w-10 h-10 rounded border border-brand-border flex items-center justify-center bg-brand-bg text-brand-dark mb-5">
                  <Icon className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-brand-dark font-medium mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
