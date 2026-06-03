'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    const redirect = searchParams.get('redirect') || '/';

    if (!token || !userEncoded) {
      setError('Invalid sign-in response. Please try again.');
      return;
    }

    const user = decodeUserPayload(userEncoded);

    if (!user) {
      setError('Could not read your account details. Please try again.');
      return;
    }

    completeGoogleAuth(token, user);

    const destination =
      user.role === 'admin' ? '/admin' : redirect.startsWith('/') ? redirect : '/';

    router.replace(destination);
  }, [searchParams, completeGoogleAuth, router]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-rose-800 font-semibold">{error}</p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-sm text-rose-600 underline font-bold"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-rose-950/50">
      <Loader2 className="w-10 h-10 animate-spin text-rose-800" />
      <span className="text-xs font-black uppercase tracking-[0.25em]">Completing Google sign-in...</span>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-rose-800" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </React.Suspense>
  );
}
