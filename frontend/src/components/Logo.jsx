'use client';

import React from 'react';
import Link from 'next/link';

const sizes = {
  sm: {
    img: 'h-[44px] w-auto max-w-[110px] sm:h-[48px] sm:max-w-[120px]',
  },
  md: {
    img: 'h-[48px] w-auto max-w-[120px] sm:h-[56px] sm:max-w-[140px] lg:h-[60px] lg:max-w-[150px]',
  },
  lg: {
    img: 'h-[52px] w-auto max-w-[130px] sm:h-[60px] sm:max-w-[150px] lg:h-[72px] lg:max-w-[180px]',
  },
};

const variants = {
  default: '',
  contrast:
    'bg-gradient-to-br from-rose-950 via-rose-900 to-rose-950 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg shadow-rose-900/25 border border-rose-800/40',
};

/**
 * Reusable Logo component.
 *
 * Props:
 *  size      — 'sm' | 'md' | 'lg'   (default 'md')
 *  variant   — 'default' | 'contrast' (dark pill for light backgrounds)
 *  href      — link target           (default '/')
 *  className — extra wrapper classes
 *  noLink    — render img only, no <Link> wrapper
 */
export default function Logo({
  size = 'md',
  variant = 'default',
  href = '/',
  className = '',
  noLink = false,
}) {
  const { img } = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.default;

  const image = (
    <img
      src="/Logo.png"
      alt="Chadani Cosmetic"
      className={`${img} object-contain object-center select-none ${
        variant === 'contrast'
          ? 'brightness-110 contrast-105 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]'
          : 'drop-shadow-[0_2px_8px_rgba(76,5,25,0.2)]'
      }`}
      draggable={false}
    />
  );

  const wrapperClass = `inline-flex items-center justify-center shrink-0 ${variantClass} ${className}`.trim();

  if (noLink) {
    return <div className={wrapperClass}>{image}</div>;
  }

  return (
    <Link href={href} className={`${wrapperClass} transition-opacity hover:opacity-90`}>
      {image}
    </Link>
  );
}
