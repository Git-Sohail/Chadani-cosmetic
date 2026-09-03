'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import ChatWidget from './chat/ChatWidget';

/** Customer/store layout only — never used under /admin */
export default function CustomerLayout({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg selection:bg-brand-accent/20 selection:text-brand-dark font-sans antialiased text-brand-text">
      {isAdmin && (
        <aside
          aria-label="Admin Storefront Mode"
          className="fixed bottom-5 left-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-brand-dark text-brand-surface shadow-xl border border-brand-accent/30 text-xs tracking-wide"
        >
          <span className="flex items-center gap-2 text-brand-surface/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Admin Preview Mode
          </span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-accent hover:bg-brand-accent/90 text-brand-surface text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Back to Dashboard</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </aside>
      )}
      <Navbar />
      <main className="flex-grow pt-[var(--nav-height-mobile)] lg:pt-[var(--nav-height-desktop)] pb-12">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
