'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Logo from '../../../components/Logo';
import { ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';

function ForgotPasswordContent() {
  const handleOpenChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat:open'));
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
            Account Recovery
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
            Password Assistance
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            Support and recovery guidance for Chadani Cosmetic clients.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center rounded-full mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-lg text-brand-dark font-medium">
                Automated Reset Notice
              </h2>
              <p className="text-xs text-brand-muted leading-relaxed text-left">
                Automated self-service password reset is currently unavailable in the customer portal.
              </p>
              <div className="p-3.5 bg-brand-bg border border-brand-border text-left space-y-2 text-xs text-brand-text">
                <p className="font-medium text-brand-dark">Available options to access your account:</p>
                <ul className="list-disc list-inside space-y-1 text-brand-muted pl-1">
                  <li>
                    If your account was registered using Google, you may sign in directly via <strong>Google Authentication</strong> on the login page.
                  </li>
                  <li>
                    For manual credential verification, contact our customer desk directly via the in-app support chat.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
              <button
                type="button"
                onClick={handleOpenChat}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-brand-border bg-brand-surface hover:border-brand-accent text-xs font-medium uppercase tracking-wider text-brand-dark transition-colors min-h-[44px] cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand-accent" />
                <span>Live Support Chat</span>
              </button>
            </div>
          </div>

          <div className="border-t border-brand-border/60 pt-4 text-center">
            <Link
              href="/"
              className="text-xs text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5 transition-colors"
            >
              &larr; Return to storefront
            </Link>
          </div>
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
          <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading recovery guidance...
          </span>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
