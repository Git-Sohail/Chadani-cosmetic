'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoryCard({
  category = {
    id: '1',
    name: 'Skincare',
    image: '',
    count: 12
  }
}) {
  return (
    <Link href={`/shop?category=${category.id}`} className="group block relative overflow-hidden rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-xl transition-all duration-350 active:scale-98">
      {/* Aspect Ratio Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pink-100/50">
        {/* Hover zoom effect on image/fallback */}
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center bg-gradient-to-br from-pink-200 to-rose-300">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-10 h-10 text-white/50" />
          )}
        </div>
        
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-rose-950/20 to-transparent opacity-90" />
        
        {/* Content overlaid on image */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white flex flex-col justify-end">
          <p className="text-xs text-rose-200 font-semibold tracking-widest uppercase mb-1">
            Collection
          </p>
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            {category.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-rose-100 font-medium group-hover:text-white transition-colors">
            <span>Explore Products</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
