'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import Logo from '../../../components/Logo';
import { getSafeRedirect } from '../../../utils/redirects';

function LoginContent() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeRedirect(rawRedirect, '/account');
  const verifiedSuccess = searchParams.get('verified') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace(safeRedirect);
      }
    }
  }, [user, safeRedirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setUnverifiedEmail('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return setError('Please enter your email address.');
    }
    if (!password) {
      return setError('Please enter your password.');
    }

    setLoading(true);

    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        // Router navigation will be triggered by the user effect or directly:
        const storedUser = JSON.parse(localStorage.getItem('bb_user') || '{}');
        if (storedUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(safeRedirect);
        }
      } else {
        setError(res.error || 'Invalid credentials.');
        if (res.requiresVerification && res.email) {
          setUnverifiedEmail(res.email);
          setInfoMessage('Your email has not been verified yet.');
        }
      }
    } catch {
      setError('A connection error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Editorial Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
            Client Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
            Welcome Back
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            Sign in to manage your orders across Dharan and view your curated collection.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
          {verifiedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Email verified successfully. Please sign in below.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
              <p>{error}</p>
              {unverifiedEmail && (
                <Link
                  href={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-brand-dark underline hover:text-brand-accent"
                >
                  <span>Verify Email Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {infoMessage && !error && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="loginEmail"
                className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-brand-accent" />
                <span>Email Address</span>
              </label>
              <input
                id="loginEmail"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={loading}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="loginPassword"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Password</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-brand-accent hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
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
              Or continue with
            </span>
          </div>

          {/* Secondary Google Sign-In */}
          <GoogleSignInButton redirectTo={safeRedirect} />
        </div>

        {/* Navigation to Registration */}
        <div className="text-center text-xs text-brand-muted space-y-2">
          <p>
            Do not have an account yet?{' '}
            <Link
              href={`/register${safeRedirect !== '/account' ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
              className="text-brand-dark font-medium underline hover:text-brand-accent transition-colors"
            >
              Create an account
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex flex-col justify-center items-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading authentication...
          </span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
