'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const GALLERY = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1631214524020-7e18db9a8f04?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1487412940907-5fffbf4a84b7?auto=format&fit=crop&q=80&w=400',
];

export default function InstagramGallery() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c89b8f]">
            <Camera className="w-4 h-4" />
            @chadanicosmetic
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2a2a2a] mt-3 font-medium">
            Follow Our Beauty Journey
          </h2>
        </ScrollReveal>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {GALLERY.map((src, i) => (
            <ScrollReveal key={src} delay={i * 0.05}>
              <motion.div
                className={`relative break-inside-avoid rounded-2xl overflow-hidden group w-full ${
                  i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={src}
                  alt={`Chadani beauty ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#7a003c]/0 group-hover:bg-[#7a003c]/30 transition-colors duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
