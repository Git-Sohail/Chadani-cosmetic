'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../../components/Button';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, User, Phone, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

function LoginContent() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const verifiedSuccess = searchParams.get('verified') === 'success';

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTo || '/');
      }
    }
  }, [user, redirectTo, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.password) return setError('Password is required.');
    if (mode === 'signup' && !formData.name.trim()) return setError('Name is required.');

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          const storedUser = JSON.parse(localStorage.getItem('bb_user') || '{}');
          if (storedUser.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(redirectTo || '/');
          }
        } else {
          setError(res.error || 'Invalid credentials.');
          if (res.requiresVerification && res.email) {
            setInfoMessage('Redirecting to email verification...');
            setTimeout(() => {
              router.push(`/verify-otp?email=${encodeURIComponent(res.email)}`);
            }, 1500);
          }
        }
      } else {
        const res = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone
        );
        if (res.success) {
          router.push(`/verify-otp?email=${encodeURIComponent(res.email)}`);
        } else {
          setError(res.error || 'Failed to register.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setInfoMessage('');
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-pink-100 rounded-[2.5rem] shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <span className="inline-flex p-2.5 bg-rose-900 text-white rounded-full mx-auto shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-rose-950">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-rose-900/60 font-semibold">
              {mode === 'login'
                ? 'Sign in to access your orders, cart, and wishlist'
                : 'Register with your email — we will send a verification code'}
            </p>
          </div>

          {verifiedSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold px-4.5 py-3.5 rounded-2xl mb-6 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Email verified successfully. Please sign in.</span>
            </div>
          )}

          {infoMessage && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold px-4.5 py-3.5 rounded-2xl mb-6">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4.5 py-3.5 rounded-2xl mb-6 space-y-2">
              <div className="flex items-start gap-2">
                <span>⚠️ {error}</span>
              </div>
              {error.toLowerCase().includes('not verified') && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
                  }
                  className="text-rose-900 hover:text-rose-950 underline font-black uppercase text-[10px] tracking-widest block pt-1 cursor-pointer text-left"
                >
                  Verify Email Now
                </button>
              )}
            </div>
          )}

          <GoogleSignInButton redirectTo={redirectTo} className="mb-6" />

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-pink-100" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-pink-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-950/60 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rose-950/60 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jane@example.com"
                className="w-full px-4 py-2.5 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-950/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="555-123-4567"
                  className="w-full px-4 py-2.5 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rose-950/60 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                required
              />
            </div>

            {mode === 'login' && (
              <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3.5 text-[11px] text-rose-900/70 space-y-1 leading-normal">
                <span className="font-extrabold text-rose-900 uppercase tracking-wider block">Admin login (no email verification):</span>
                <span className="block">admin@chadanicosmetic.com / admin123</span>
                <span className="font-extrabold text-rose-900 uppercase tracking-wider block mt-2">Demo customer:</span>
                <span className="block">jane@example.com / customer123</span>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="shadow-lg hover:shadow-xl hover:shadow-rose-900/10"
              >
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-pink-50 text-xs font-semibold text-rose-900/60">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-rose-700 hover:text-rose-900 underline font-bold cursor-pointer"
            >
              {mode === 'login' ? 'Register here' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
          <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Loading authentication portal...</span>
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
