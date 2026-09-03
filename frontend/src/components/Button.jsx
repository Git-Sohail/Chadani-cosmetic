'use client';

import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-brand-dark text-brand-surface hover:bg-brand-accent border border-brand-dark hover:border-brand-accent shadow-sm',
    secondary:
      'bg-transparent text-brand-text hover:bg-brand-surface border border-brand-border hover:border-brand-accent shadow-none',
    outline:
      'bg-transparent text-brand-dark hover:bg-brand-dark hover:text-brand-surface border border-brand-dark/80',
    text:
      'bg-transparent text-brand-text hover:text-brand-accent p-0 border-0 shadow-none',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs rounded-sm',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded',
    lg: 'px-7 py-3.5 text-sm sm:text-base rounded',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
