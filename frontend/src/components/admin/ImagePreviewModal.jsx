'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ imageUrl, alt = 'Product preview', onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-brand-surface overflow-hidden shadow-2xl p-2 border border-brand-border"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-brand-surface/90 text-brand-dark hover:bg-brand-dark hover:text-brand-surface transition-colors cursor-pointer border border-brand-border"
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-full max-h-[82vh] overflow-hidden flex items-center justify-center bg-brand-bg/50">
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[82vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
