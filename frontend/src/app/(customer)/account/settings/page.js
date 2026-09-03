'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../components/Toast';
import ProfileAvatarUploader from '../../../../components/profile/ProfileAvatarUploader';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import axios from 'axios';

export default function AccountSettingsPage() {
  const {
    user,
    token,
    API_URL,
    updateProfile,
    uploadProfileAvatar,
    removeProfileAvatar,
  } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Google-only account detection
  const isGoogleOnly = !!user?.googleId && !user?.hasPassword;

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast('Please provide your full name', 'error');
    setSavingProfile(true);
    const res = await updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
    });
    setSavingProfile(false);
    if (res.success) toast('Profile details saved successfully', 'success');
    else toast(res.error || 'Could not update profile', 'error');
  };

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    const res = await uploadProfileAvatar(file);
    setUploadingAvatar(false);
    if (res.success) toast('Profile photo updated', 'success');
    else toast(res.error || 'Upload failed', 'error');
  };

  const handleAvatarRemove = async () => {
    if (!confirm('Remove profile photo?')) return;
    setUploadingAvatar(true);
    const res = await removeProfileAvatar();
    setUploadingAvatar(false);
    if (res.success) toast('Profile photo removed', 'info');
    else toast(res.error || 'Could not remove photo', 'error');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.oldPassword || !pwForm.newPassword) {
      return toast('Current and new password are required', 'error');
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast('New passwords do not match', 'error');
    }
    if (pwForm.newPassword.length < 6) {
      return toast('New password must be at least 6 characters', 'error');
    }
    setSavingPw(true);
    try {
      await axios.put(
        `${API_URL}/auth/profile/password`,
        { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('Password updated successfully', 'success');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Could not update password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text focus:outline-none focus:border-brand-accent';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
          Preferences
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
          Profile & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-xl leading-relaxed">
          Manage your personal details for doorstep delivery in Dharan and update your security credentials.
        </p>
      </div>

      {/* Profile Photo & Account Status */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-base text-brand-dark font-medium pb-3 border-b border-brand-border/60">
          Profile Photo
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <ProfileAvatarUploader
            name={user?.name}
            profileImage={user?.profileImage}
            uploading={uploadingAvatar}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
          <div className="space-y-1.5">
            <p className="font-serif text-base text-brand-dark font-medium">{user?.name}</p>
            <p className="text-xs text-brand-muted font-mono">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Verified Customer</span>
                </span>
              )}
              {user?.createdAt && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-muted font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Member since{' '}
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Contact Details Form */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-5">
        <h2 className="font-serif text-base text-brand-dark font-medium pb-3 border-b border-brand-border/60">
          Personal Information
        </h2>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profileName"
                className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
              >
                <User className="w-3 h-3 text-brand-accent" /> Full Name *
              </label>
              <input
                id="profileName"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profilePhone"
                className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-brand-accent" /> Contact Phone
              </label>
              <input
                id="profilePhone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+977 98XXXXXXXX"
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profileEmail"
              className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
            >
              <Mail className="w-3 h-3 text-brand-accent" /> Email Address
            </label>
            <input
              id="profileEmail"
              type="email"
              value={user?.email || ''}
              disabled
              className={`${inputCls} opacity-60 bg-brand-bg cursor-not-allowed font-mono`}
            />
            <p className="text-[11px] text-brand-muted">
              Email address is linked to your order confirmations and cannot be modified directly.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      {!isGoogleOnly && (
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-base text-brand-dark font-medium pb-3 border-b border-brand-border/60 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-accent" />
            <span>Change Password</span>
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="oldPassword"
                className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
              >
                Current Password *
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  type={showOldPw ? 'text' : 'password'}
                  value={pwForm.oldPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, oldPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className={inputCls}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-1"
                  aria-label={showOldPw ? 'Hide password' : 'Show password'}
                >
                  {showOldPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="newPassword"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                >
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPw ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className={inputCls}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-1"
                    aria-label={showNewPw ? 'Hide password' : 'Show password'}
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                >
                  Confirm New Password *
                </label>
                <input
                  id="confirmPassword"
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPw}
                className="px-6 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
              >
                {savingPw ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isGoogleOnly && (
        <div className="bg-brand-surface border border-brand-border p-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-brand-muted leading-relaxed">
            <p className="font-medium text-brand-dark">Google Sign-In Active</p>
            <p>
              Your account is authenticated via Google. Security credentials and two-factor authentication are managed directly by your Google account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
