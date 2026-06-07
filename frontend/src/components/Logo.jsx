'use client';

import React from 'react';
import Link from 'next/link';

const sizes = {
  sm: {
    img: 'h-[38px] w-[90px] sm:h-[42px] sm:w-[100px] lg:h-[50px] lg:w-[120px]',
  },
  md: {
    img: 'h-[40px] w-[95px] sm:h-[48px] sm:w-[115px] lg:h-[56px] lg:w-[135px]',
  },
  lg: {
    img: 'h-[42px] w-[100px] sm:h-[52px] sm:w-[130px] lg:h-[58px] lg:w-[150px]',
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
      className={`${img} max-w-full object-contain object-center select-none drop-shadow-[0_1px_2px_rgba(76,5,25,0.12)]`}
      draggable={false}
    />
  );

  if (noLink) {
    return <div className={`inline-flex items-center ${className}`}>{image}</div>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center transition-opacity hover:opacity-85 ${className}`}
    >
      {image}
    </Link>
  );
}
