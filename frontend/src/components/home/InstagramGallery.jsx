'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const GALLERY = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1487412940907-5fffbf4a84b7?auto=format&fit=crop&q=80&w=400',
];

export default function InstagramGallery() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-luxury-rose-gold">
            <Camera className="w-3.5 h-3.5" />
            @chadanicosmetic
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text mt-2 font-medium">
            Follow Our Beauty Journey
          </h2>
        </ScrollReveal>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-3 space-y-2.5 sm:space-y-3">
          {GALLERY.map((src, i) => (
            <ScrollReveal key={src} delay={i * 0.04}>
              <motion.div
                className={`relative break-inside-avoid rounded-xl overflow-hidden group w-full ${
                  i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <Image src={src} alt={`Beauty ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-luxury-burgundy/0 group-hover:bg-luxury-burgundy/25 transition-colors flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
