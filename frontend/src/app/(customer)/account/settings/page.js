'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../components/Toast';
import ProfileAvatarUploader from '../../../../components/profile/ProfileAvatarUploader';
import { User, Phone, Mail, Lock, Settings, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function AccountSettingsPage() {
  const {
    user, token, API_URL,
    updateProfile, uploadProfileAvatar, removeProfileAvatar, refreshProfile,
  } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  // Is Google-only account (no password set)
  const isGoogleOnly = !!user?.googleId && !user?.hasPassword;

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast('Name is required', 'error');
    setSavingProfile(true);
    const res = await updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim() });
    setSavingProfile(false);
    if (res.success) toast('Profile updated successfully', 'success');
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
    if (!pwForm.oldPassword || !pwForm.newPassword) return toast('All fields are required', 'error');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast('Passwords do not match', 'error');
    if (pwForm.newPassword.length < 6) return toast('Password must be at least 6 characters', 'error');
    setSavingPw(true);
    try {
      await axios.put(`${API_URL}/auth/profile/password`,
        { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('Password changed successfully', 'success');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Could not change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-pink-50/20 border border-pink-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-rose-950 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#7A003C]" /> Account Settings
        </h1>
      </div>

      {/* Profile picture */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm space-y-4">
        <h2 className="font-black text-rose-950 text-sm uppercase tracking-widest">Profile Picture</h2>
        <div className="flex items-center gap-5">
          <ProfileAvatarUploader
            name={user?.name}
            profileImage={user?.profileImage}
            uploading={uploadingAvatar}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
          <div>
            <p className="text-sm font-bold text-rose-950">{user?.name}</p>
            <p className="text-xs text-rose-900/50">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm space-y-5">
        <h2 className="font-black text-rose-950 text-sm uppercase tracking-widest">Personal Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input type="text" value={profileForm.name}
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+977 98XXXXXXXX" className={inputCls} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input type="email" value={user?.email || ''} disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`} />
            <p className="text-[10px] text-rose-900/40 font-medium">Email cannot be changed.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile}
              className="px-6 py-2.5 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#5a002c] disabled:opacity-50 transition-colors">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      {!isGoogleOnly && (
        <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm space-y-5">
          <h2 className="font-black text-rose-950 text-sm uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7A003C]" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest">Current Password</label>
              <input type="password" value={pwForm.oldPassword}
                onChange={(e) => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                placeholder="••••••••" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest">New Password</label>
                <input type="password" value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest">Confirm New Password</label>
                <input type="password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingPw}
                className="px-6 py-2.5 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#5a002c] disabled:opacity-50 transition-colors">
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isGoogleOnly && (
        <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-rose-900/60 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>You signed in with Google. Password management is handled by your Google account.</span>
          </div>
        </div>
      )}
    </div>
  );
}
