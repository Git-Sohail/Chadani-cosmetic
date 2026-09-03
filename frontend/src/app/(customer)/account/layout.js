'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { resolveImageUrl } from '../../../utils/imageUrl';
import Avatar from '../../../components/Avatar';
import {
  LayoutDashboard,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

export default function AccountLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/account');
    if (!loading && user?.role === 'admin') router.replace('/admin');
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center gap-3 text-brand-muted">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Loading account...</span>
      </div>
    );
  }

  if (!user || user.role === 'admin') return null;

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden mb-6 border-b border-brand-border pb-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={user.profileImage} name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base text-brand-dark truncate">{user.name}</p>
              <p className="text-[11px] text-brand-muted truncate font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-1 pb-1 -mx-4 px-4 scrollbar-none">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors min-h-[44px] border ${
                    active
                      ? 'bg-brand-dark text-brand-surface border-brand-dark'
                      : 'bg-brand-surface text-brand-muted border-brand-border hover:text-brand-dark'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop Left-Side Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-[calc(var(--nav-height-desktop)+1.5rem)]">
            <div className="bg-brand-surface border border-brand-border overflow-hidden">
              {/* Customer Profile Header */}
              <div className="p-6 border-b border-brand-border/60 space-y-3">
                <div className="flex items-center gap-3.5">
                  <Avatar src={user.profileImage} name={user.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-brand-dark truncate">{user.name}</p>
                    <p className="text-xs text-brand-muted truncate font-mono">{user.email}</p>
                  </div>
                </div>

                {user.isVerified && (
                  <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Account</span>
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className="p-2 space-y-0.5">
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors min-h-[44px] ${
                        active
                          ? 'bg-brand-dark text-brand-surface'
                          : 'text-brand-text hover:bg-brand-bg hover:text-brand-dark'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-brand-accent" />}
                    </Link>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-brand-border/50">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium uppercase tracking-wider text-brand-muted hover:text-red-700 hover:bg-red-50/50 transition-colors min-h-[44px] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Account Area */}
          <main className="lg:col-span-9 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
