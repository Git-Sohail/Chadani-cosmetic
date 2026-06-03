'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, Sparkles, Trash2, Upload } from 'lucide-react';
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

  const displayUrl = preview || resolveImageUrl(profileImage);
  const initial = (name || '?').charAt(0).toUpperCase();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
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

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative group ${dragOver ? 'scale-[1.02]' : ''} transition-transform duration-300`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-rose-600 via-pink-400 to-amber-300 opacity-80 blur-sm animate-pulse" />
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-rose-900 via-rose-600 to-pink-400" />

        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-rose-950 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 disabled:cursor-wait"
          aria-label="Change profile photo"
        >
          {displayUrl ? (
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-4xl sm:text-5xl font-black text-white">{initial}</span>
          )}

          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-rose-950/65 text-white transition-opacity duration-300 ${
              uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Camera className="w-7 h-7" />
                <span className="text-[9px] font-black uppercase tracking-widest">Update</span>
              </>
            )}
          </div>
        </button>

        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white border-2 border-pink-100 shadow-lg flex items-center justify-center text-rose-900 pointer-events-none">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-900/40">
        JPG, PNG or WebP · max 5MB
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-rose-950 transition-colors disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload photo
        </button>
        {profileImage && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-pink-200 text-rose-800 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>

      <p className="mt-2 text-[10px] text-rose-900/35 font-semibold">or drag & drop onto your avatar</p>
    </div>
  );
}
