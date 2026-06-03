'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ imageUrl, alt = 'Product preview', onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-rose-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-3 border border-pink-100"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 text-rose-950 hover:bg-rose-900 hover:text-white transition-all shadow-md"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full max-h-[85vh] object-contain rounded-2xl bg-pink-50/30"
        />
      </div>
    </div>
  );
}
