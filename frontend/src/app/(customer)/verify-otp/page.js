'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Logo from '../../../components/Logo';
import { KeyRound, ArrowRight, RefreshCw, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

function VerifyOtpContent() {
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    const numeric = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = numeric.slice(-1);
    setOtp(newOtp);

    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      return setError('Please enter the complete 6-digit verification code.');
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, fullOtp);
      if (res.success) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          router.push('/login?verified=success');
        }, 2000);
      } else {
        setError(res.error || 'Verification code is invalid or has expired.');
      }
    } catch {
      setError('A connection issue occurred. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setError('');
    setResendLoading(true);
    try {
      const res = await resendOtp(email);
      if (res.success) {
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
        setTimer(60);
        setCanResend(false);
      } else {
        setError(res.error || 'Could not resend verification code.');
        if (!res.error?.includes('wait')) {
          setCanResend(true);
        }
      }
    } catch {
      setError('Failed to resend code. Please try again shortly.');
      setCanResend(true);
    } finally {
      setResendLoading(false);
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
            Email Verification
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
            Enter 6-Digit Code
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            We sent a verification code to{' '}
            <strong className="text-brand-dark font-mono block mt-0.5 break-all">{email}</strong>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
          {verifiedSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center rounded-full mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-lg text-brand-dark font-medium">
                Email Verified Successfully
              </h2>
              <p className="text-xs text-brand-muted">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                {/* 6 Digit Input Group */}
                <div
                  className="flex justify-between gap-2 sm:gap-2.5"
                  onPaste={handlePaste}
                  role="group"
                  aria-label="6-digit verification code"
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      disabled={loading}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-lg font-medium text-brand-dark bg-brand-bg border border-brand-border rounded focus:outline-none focus:border-brand-accent focus:bg-brand-surface transition-colors"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Cooldown Section */}
              <div className="pt-4 border-t border-brand-border/60 text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-dark font-medium uppercase tracking-wider hover:text-brand-accent transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
                  >
                    {resendLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-brand-accent" />
                    )}
                    <span>{resendLoading ? 'Dispatching...' : 'Resend Verification Code'}</span>
                  </button>
                ) : (
                  <p className="text-brand-muted font-mono text-[11px]">
                    Resend code in <strong className="text-brand-dark font-semibold">{timer}s</strong>
                  </p>
                )}
              </div>
            </>
          )}

          <div className="border-t border-brand-border/60 pt-4 text-center">
            <Link
              href="/login"
              className="text-xs text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col justify-center items-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading verification...
          </span>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
