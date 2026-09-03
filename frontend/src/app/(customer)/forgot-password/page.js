'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Logo from '../../../components/Logo';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    // Neutral simulated flow to avoid account enumeration
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
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
            Account Recovery
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
            Password Assistance
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center rounded-full mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-lg text-brand-dark font-medium">
                  Check Your Inbox
                </h2>
                <p className="text-xs text-brand-muted leading-relaxed">
                  If an account exists for <strong className="text-brand-dark">{email}</strong>, recovery guidance has been dispatched. Please check your spam folder if it does not arrive within a few minutes.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="recoveryEmail"
                  className="text-[11px] font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Registered Email</span>
                </label>
                <input
                  id="recoveryEmail"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 transition-colors min-h-[44px] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Send Recovery Instructions</span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-brand-border/60 pt-4 text-center">
            <Link
              href="/login"
              className="text-xs text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-[11px] text-brand-muted/70 hover:text-brand-dark transition-colors"
          >
            &larr; Return to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex flex-col justify-center items-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading recovery portal...
          </span>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

