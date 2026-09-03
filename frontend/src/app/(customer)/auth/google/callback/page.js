'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSafeRedirect } from '@/utils/redirects';

function decodeBase64Url(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const base64 = pad ? padded + '='.repeat(4 - pad) : padded;
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );
}

function decodeUserPayload(encoded) {
  try {
    return JSON.parse(decodeBase64Url(encoded));
  } catch {
    return null;
  }
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeGoogleAuth } = useAuth();
  const [error, setError] = useState('');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(searchParams.get('message') || 'Google sign-in was not completed.');
      return;
    }

    const token = searchParams.get('token');
    const userEncoded = searchParams.get('user');
    const rawRedirect = searchParams.get('redirect');
    const safeDestination = getSafeRedirect(rawRedirect, '/account');

    if (!token || !userEncoded) {
      setError('Invalid sign-in response. Please try again.');
      return;
    }

    const user = decodeUserPayload(userEncoded);
    if (!user) {
      setError('Could not process your account details. Please try signing in again.');
      return;
    }

    completeGoogleAuth(token, user);

    const destination = user.role === 'admin' ? '/admin' : safeDestination;
    router.replace(destination);
  }, [searchParams, completeGoogleAuth, router]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center max-w-sm mx-auto">
        <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-700 flex items-center justify-center rounded-full">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-lg text-brand-dark font-medium">Authentication Failed</h2>
          <p className="text-xs text-brand-muted leading-relaxed">{error}</p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors min-h-[44px]"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-brand-muted">
      <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      <span className="text-xs font-mono uppercase tracking-widest">
        Finalizing Google sign-in...
      </span>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading portal...
          </span>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
