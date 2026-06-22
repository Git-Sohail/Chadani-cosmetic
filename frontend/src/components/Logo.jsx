'use client';

import React from 'react';
import Link from 'next/link';

const sizes = {
  sm: {
    img: 'h-[40px] w-auto max-w-[120px]',
  },
  md: {
    img: 'h-[44px] w-auto max-w-[140px] sm:h-[48px] sm:max-w-[155px]',
  },
  lg: {
    img: 'h-[48px] w-auto max-w-[150px] sm:h-[54px] sm:max-w-[165px] lg:h-[58px] lg:max-w-[170px]',
  },
};

export default function Logo({ size = 'md', href = '/', className = '', noLink = false }) {
  const { img } = sizes[size] || sizes.md;

  const image = (
    <img
      src="/Logo.png"
      alt="Chadani Cosmetic"
      className={`${img} max-w-[170px] object-contain object-left select-none`}
      draggable={false}
    />
  );

  const wrapperClass = `inline-flex items-center shrink-0 bg-transparent ${className}`.trim();

  if (noLink) {
    return <div className={wrapperClass}>{image}</div>;
  }

  return (
    <Link href={href} className={`${wrapperClass} transition-opacity hover:opacity-85`}>
      {image}
    </Link>
  );
}
