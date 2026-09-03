'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { resolveImageUrl } from '../utils/imageUrl';

const SIZES = {
  xs: 'w-7 h-7 text-[11px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs sm:text-sm',
  lg: 'w-12 h-12 text-base sm:text-lg',
  xl: 'w-14 h-14 text-lg sm:text-xl',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
};

/**
 * Shared Chadani Customer Avatar
 * Automatically falls back to the customer's initial in the brand palette
 * if the image is missing or fails to load, preventing broken image icons.
 */
export default function Avatar({
  src,
  name = 'Guest',
  size = 'md',
  className = '',
  priority = false,
}) {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(src);

  // Reset error state if image source changes
  useEffect(() => {
    setHasError(false);
  }, [resolved]);

  const initial = (name || 'C').trim().charAt(0).toUpperCase() || 'C';
  const sizeClasses = SIZES[size] || SIZES.md;

  const showImage = Boolean(resolved) && !hasError;

  return (
    <div
      className={`relative shrink-0 rounded-full border border-brand-border/80 bg-brand-surface overflow-hidden flex items-center justify-center font-serif text-brand-dark select-none ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={resolved}
          alt={name ? `${name}'s profile` : 'Customer avatar'}
          fill
          sizes="(max-width: 768px) 48px, 96px"
          priority={priority}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-serif font-medium tracking-tight text-brand-dark">
          {initial}
        </span>
      )}
    </div>
  );
}
