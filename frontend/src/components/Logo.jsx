'use client';

import React from 'react';
import Link from 'next/link';

const sizes = {
  sm: {
    img: 'h-[48px] w-auto max-w-[130px] sm:h-[52px] sm:max-w-[140px]',
  },
  md: {
    img: 'h-[52px] w-auto max-w-[140px] sm:h-[60px] sm:max-w-[165px] lg:h-[68px] lg:max-w-[185px]',
  },
  lg: {
    img: 'h-[58px] w-auto max-w-[155px] sm:h-[66px] sm:max-w-[175px] lg:h-[80px] lg:max-w-[220px]',
  },
};

/**
 * Reusable Logo component.
 *
 * Props:
 *  size      — 'sm' | 'md' | 'lg'   (default 'md')
 *  href      — link target           (default '/')
 *  className — extra wrapper classes
 *  noLink    — render img only, no <Link> wrapper
 */
export default function Logo({ size = 'md', href = '/', className = '', noLink = false }) {
  const { img } = sizes[size] || sizes.md;

  const image = (
    <img
      src="/Logo.png"
      alt="Chadani Cosmetic"
      className={`${img} object-contain object-center select-none contrast-[1.15] saturate-[1.2] drop-shadow-[0_2px_10px_rgba(76,5,25,0.35)]`}
      draggable={false}
    />
  );

  const wrapperClass = `inline-flex items-center justify-center shrink-0 ${className}`.trim();

  if (noLink) {
    return <div className={wrapperClass}>{image}</div>;
  }

  return (
    <Link href={href} className={`${wrapperClass} transition-opacity hover:opacity-90`}>
      {image}
    </Link>
  );
}
