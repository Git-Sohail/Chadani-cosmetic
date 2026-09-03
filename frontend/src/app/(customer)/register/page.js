'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import Logo from '../../../components/Logo';
import { getSafeRedirect } from '../../../utils/redirects';

function RegisterContent() {
  const { register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeRedirect(rawRedirect, '/account');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace(safeRedirect);
      }
    }
  }, [user, safeRedirect, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      return setError('Please enter your full name.');
    }
    if (!trimmedEmail) {
      return setError('Please enter a valid email address.');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please re-enter.');
    }

    setLoading(true);

    try {
      const res = await register(
        trimmedName,
        trimmedEmail,
        formData.password,
        formData.phone.trim() || undefined
      );

      if (res.success) {
        // Proceed to OTP verification screen
        router.push(
          `/verify-otp?email=${encodeURIComponent(res.email || trimmedEmail)}`
        );
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('A connection error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Editorial Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
            New Client Registration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
            Create Your Account
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            Register with your email to enjoy seamless delivery coordination across Dharan.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity & Contact Section */}
            <div className="space-y-3 pb-3 border-b border-brand-border/60">
              <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium block">
                1. Personal Details
              </span>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="registerName"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Full Name *</span>
                </label>
                <input
                  id="registerName"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Maya Shrestha"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="registerEmail"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Email Address *</span>
                </label>
                <input
                  id="registerEmail"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="maya@example.com"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
                <span className="text-[10px] text-brand-muted block">
                  A 6-digit verification code will be dispatched to this address.
                </span>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="registerPhone"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Phone Number (Optional)</span>
                </label>
                <input
                  id="registerPhone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+977 98XXXXXXXX"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
            </div>

            {/* Password Creation Section */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium block">
                2. Security Credentials
              </span>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="registerPassword"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Create Password *</span>
                </label>
                <div className="relative">
                  <input
                    id="registerPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 8 characters"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 pr-10 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="registerConfirmPassword"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted block"
                >
                  Confirm Password *
                </label>
                <input
                  id="registerConfirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register & Continue</span>
                )}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border/60" />
            </div>
            <span className="relative px-3 bg-brand-surface text-[10px] uppercase tracking-widest text-brand-muted">
              Or register with
            </span>
          </div>

          {/* Google Sign-Up */}
          <GoogleSignInButton redirectTo={safeRedirect} />
        </div>

        {/* Navigation to Login */}
        <div className="text-center text-xs text-brand-muted space-y-2">
          <p>
            Already have an account?{' '}
            <Link
              href={`/login${safeRedirect !== '/account' ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
              className="text-brand-dark font-medium underline hover:text-brand-accent transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <div>
            <Link
              href="/"
              className="text-[11px] text-brand-muted/70 hover:text-brand-dark transition-colors inline-flex items-center gap-1"
            >
              &larr; Return to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col justify-center items-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading registration...
          </span>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

