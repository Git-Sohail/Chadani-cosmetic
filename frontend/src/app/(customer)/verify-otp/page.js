'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { ShieldAlert, KeyRound, ArrowRight, RefreshCw, CheckCircle2, Loader2, X } from 'lucide-react';

export function VerifyOtpContent() {
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifiedModal, setVerifiedModal] = useState(false);

  const inputRefs = useRef([]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

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
      router.push('/login');
    }
  }, [email, router]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
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

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      return setError('Please enter the complete 6-digit verification code.');
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, fullOtp);
      if (res.success) {
        setVerifiedModal(true);
        showToast('Email verified successfully. Please sign in.', 'success');
        setTimeout(() => {
          router.push('/login?verified=success');
        }, 2500);
      } else {
        setError(res.error || 'Verification failed. Please try again.');
        showToast(res.error || 'Verification failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during verification.');
      showToast('An unexpected error occurred.', 'error');
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
        showToast('Verification code has been sent to your email.', 'success');
        setTimer(60);
        setCanResend(false);
      } else {
        setError(res.error || 'Failed to resend code.');
        showToast(res.error || 'Failed to resend code.', 'error');
        if (!res.error?.includes('wait')) {
          setCanResend(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to resend verification code.');
      showToast('Failed to resend verification code.', 'error');
      setCanResend(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold max-w-sm animate-slideIn ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
          }`}
        >
          {toast.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {verifiedModal && (
        <div className="fixed inset-0 z-[150] bg-rose-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-pink-100 shadow-2xl p-8 max-w-sm w-full text-center space-y-4 relative">
            <button
              type="button"
              onClick={() => router.push('/login?verified=success')}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-pink-50 text-rose-950/50"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-serif font-black text-xl text-rose-950">Email Verified!</h3>
            <p className="text-sm text-rose-900/60 font-medium">
              Email verified successfully. Please sign in.
            </p>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => router.push('/login?verified=success')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-pink-100 rounded-[2.5rem] shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <span className="inline-flex p-3 bg-rose-50 text-rose-950 rounded-full mx-auto border border-pink-100 shadow-sm">
              <KeyRound className="w-6 h-6 text-rose-700" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-rose-950">Verify Your Email</h2>
            <p className="text-xs text-rose-900/60 font-semibold max-w-xs mx-auto leading-relaxed">
              Verification code has been sent to{' '}
              <span className="text-rose-950 font-bold block mt-0.5">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4.5 py-3 rounded-2xl mb-6 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black text-rose-950 bg-pink-50/20 border-2 border-pink-100/70 focus:border-rose-900 focus:bg-white rounded-2xl focus:outline-none transition-all"
                  required
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="py-4.5 rounded-2xl shadow-xl shadow-rose-900/10 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <span>Verify</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center pt-8 mt-8 border-t border-pink-50 text-xs font-semibold">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1.5 mx-auto font-bold cursor-pointer disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{resendLoading ? 'Sending...' : 'Resend OTP'}</span>
              </button>
            ) : (
              <p className="text-rose-900/40">
                Resend OTP in <span className="text-rose-950 font-bold">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
          <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Loading verification...</span>
        </div>
      }
    >
      <VerifyOtpContent />
    </React.Suspense>
  );
}
