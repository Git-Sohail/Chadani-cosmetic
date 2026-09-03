'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function ProfileAvatarUploader({
  name,
  profileImage,
  uploading,
  onUpload,
  onRemove,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayUrl = preview || resolveImageUrl(profileImage);
  const initial = (name || 'C').trim().charAt(0).toUpperCase() || 'C';

  useEffect(() => {
    setImgError(false);
  }, [displayUrl]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setImgError(false);
    onUpload(file).finally(() => {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
    });
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const showPhoto = Boolean(displayUrl) && !imgError;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative group ${dragOver ? 'scale-105' : ''} transition-transform duration-200`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-brand-border bg-brand-surface shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:cursor-wait cursor-pointer transition-all hover:border-brand-accent"
          aria-label="Change profile photo"
        >
          {showPhoto ? (
            <img
              src={displayUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-serif text-3xl sm:text-4xl font-normal text-brand-dark">
              {initial}
            </span>
          )}

          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-brand-dark/70 text-brand-surface transition-opacity duration-200 ${
              uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-brand-surface" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-brand-surface" />
                <span className="text-[9px] font-medium uppercase tracking-widest text-brand-surface">
                  Change
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />

      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium">
        JPG, PNG or WebP · Max 5MB
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-brand-surface text-[10px] font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer min-h-[36px]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload photo</span>
        </button>
        {profileImage && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-brand-border text-brand-muted hover:text-red-700 text-[10px] font-medium uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer min-h-[36px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <p className="mt-1.5 text-[10px] text-brand-muted/70">or drag & drop onto your avatar</p>
    </div>
  );
}
