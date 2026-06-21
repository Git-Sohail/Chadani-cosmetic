'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import ChatWidget from './chat/ChatWidget';

/** Customer/store layout only — never used under /admin */
export default function CustomerLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  if (user?.role === 'admin') {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-rose-50/10">
        <div className="text-center p-8 bg-white rounded-3xl border border-pink-100 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-900 mx-auto mb-4" />
          <p className="text-sm font-bold text-rose-900/60">Redirecting to Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fff5f7] selection:bg-[#c89b8f]/30 selection:text-[#7a003c] font-sans antialiased text-[#2a2a2a]">
      <Navbar />
      <main className="flex-grow pt-[var(--nav-height-mobile)] lg:pt-[var(--nav-height-desktop)] pb-12">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
