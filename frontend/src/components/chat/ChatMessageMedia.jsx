'use client';

import React, { useState, useEffect } from 'react';
import { X, ImageOff, VideoOff, Maximize2, Play } from 'lucide-react';

export default function ChatMessageMedia({
  mediaUrl,
  mediaType,
  mediaName,
  caption,
  isCustomerMessage,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen]);

  if (!mediaUrl) return null;

  const isVideo = mediaType === 'video' || /\.(mp4|webm)$/i.test(mediaUrl);

  return (
    <div className="space-y-2">
      {/* Lightbox Modal for Images */}
      {lightboxOpen && !isVideo && (
        <div
          className="fixed inset-0 z-[300] bg-brand-dark/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 p-2 text-brand-surface hover:text-brand-accent transition-colors cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={mediaUrl}
              alt={mediaName || caption || 'Shared photo'}
              className="max-w-full max-h-[80vh] object-contain rounded border border-brand-border/40 shadow-2xl"
            />
            {caption && (
              <p className="mt-3 text-xs text-brand-surface text-center font-medium max-w-md">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Media Element */}
      {loadError ? (
        <div className="flex items-center gap-2 p-3 rounded bg-black/10 text-xs text-brand-muted">
          {isVideo ? <VideoOff className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
          <span>Media unavailable</span>
        </div>
      ) : isVideo ? (
        <div className="rounded overflow-hidden bg-black/5 max-w-[280px] sm:max-w-[320px]">
          <video
            src={mediaUrl}
            controls
            playsInline
            preload="metadata"
            onError={() => setLoadError(true)}
            className="w-full max-h-[260px] rounded object-cover"
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="relative group rounded overflow-hidden max-w-[240px] sm:max-w-[280px] max-h-[240px] cursor-pointer">
          <img
            src={mediaUrl}
            alt={mediaName || caption || 'Chat attachment'}
            loading="lazy"
            onError={() => setLoadError(true)}
            onClick={() => setLightboxOpen(true)}
            className="w-full h-auto object-cover rounded border border-black/10 transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-brand-dark/70 text-brand-surface opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Enlarge image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Caption text */}
      {caption && (
        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed pt-0.5">
          {caption}
        </p>
      )}
    </div>
  );
}
