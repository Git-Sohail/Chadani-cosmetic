'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/Button';
import ProfileAvatarUploader from '../../../components/profile/ProfileAvatarUploader';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowLeft,
  Heart,
  ShoppingBag,
  Crown,
} from 'lucide-react';

export default function CustomerProfilePage() {
  const {
    user,
    loading: authLoading,
    refreshProfile,
    updateProfile,
    uploadProfileAvatar,
    removeProfileAvatar,
  } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user) {
      refreshProfile().then((result) => {
        if (!result.success && result.error) {
          setError(result.error);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
    });

    setSaving(false);
    if (result.success) {
      setSuccess(result.message || 'Profile updated successfully.');
    } else {
      setError(result.error);
    }
  };

  const handleUploadPhoto = async (file) => {
    setUploadingPhoto(true);
    setError('');
    setSuccess('');
    const result = await uploadProfileAvatar(file);
    setUploadingPhoto(false);
    if (result.success) {
      setSuccess(result.message || 'Looking fabulous — photo saved!');
    } else {
      setError(result.error);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Remove your profile photo?')) return;
    setUploadingPhoto(true);
    setError('');
    const result = await removeProfileAvatar();
    setUploadingPhoto(false);
    if (result.success) {
      setSuccess(result.message || 'Profile photo removed.');
    } else {
      setError(result.error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Syncing Profile...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        type="button"
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-900/70 hover:text-rose-900 mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </button>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-950 via-rose-900 to-pink-800 text-white p-8 sm:p-10 mb-10 shadow-2xl shadow-rose-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <div className="shrink-0 mx-auto sm:mx-0">
            <ProfileAvatarUploader
              name={user.name}
              profileImage={user.profileImage}
              uploading={uploadingPhoto}
              onUpload={handleUploadPhoto}
              onRemove={handleRemovePhoto}
            />
          </div>
          <div className="text-center sm:text-left flex-1 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              Chadani Member
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">{user.name}</h1>
            <p className="text-rose-100/80 text-sm font-medium">{user.email}</p>
            {user.isVerified && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                Verified account
              </span>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-5 py-4 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-5 py-4 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-pink-100 rounded-[2rem] p-6 shadow-sm space-y-4">
            <span className="text-[9px] font-black text-rose-950/40 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Account snapshot
            </span>
            <div className="space-y-3 text-sm text-rose-950/70 font-semibold">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-rose-700 shrink-0" />
                <span>
                  Member since{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{user.phone || 'Add a phone number'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="p-4 bg-white border border-pink-100 rounded-2xl text-rose-950 hover:bg-rose-900 hover:text-white transition-all flex flex-col items-center gap-2 font-bold text-xs cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-5 h-5" />
              My Orders
            </button>
            <button
              type="button"
              onClick={() => router.push('/wishlist')}
              className="p-4 bg-white border border-pink-100 rounded-2xl text-rose-950 hover:bg-rose-900 hover:text-white transition-all flex flex-col items-center gap-2 font-bold text-xs cursor-pointer shadow-sm"
            >
              <Heart className="w-5 h-5" />
              Wishlist
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-pink-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
          <h2 className="font-serif font-black text-2xl text-rose-950 mb-1">Edit your details</h2>
          <p className="text-[10px] text-rose-900/40 font-black uppercase tracking-wider mb-8">
            Keep shipping and contact info up to date
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-rose-700" />
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-rose-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rose-700" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-rose-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-rose-700" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-5 py-3.5 bg-pink-50/10 border border-pink-100 rounded-2xl text-sm font-bold text-rose-950/40 cursor-not-allowed"
              />
              <p className="text-[10px] text-rose-900/40 font-semibold ml-1">
                Email cannot be changed — used for login and order updates.
              </p>
            </div>

            <div className="pt-4 border-t border-pink-50 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                className="px-10 py-4 rounded-2xl shadow-xl shadow-rose-900/10"
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
