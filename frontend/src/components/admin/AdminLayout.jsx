'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FileSpreadsheet,
  MessageSquare,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, match: (p) => p === '/admin' },
  { name: 'Inventory', href: '/admin/products', icon: ShoppingBag, match: (p) => p.startsWith('/admin/products') },
  { name: 'Collections', href: '/admin/categories', icon: Layers, match: (p) => p.startsWith('/admin/categories') || p.startsWith('/admin/collections') },
  { name: 'Orders', href: '/admin/orders', icon: FileSpreadsheet, match: (p) => p.startsWith('/admin/orders') },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, match: (p) => p.startsWith('/admin/messages') },
];

function breadcrumbLabel(pathname) {
  if (pathname === '/admin') return 'dashboard';
  const segment = pathname.split('/').filter(Boolean)[1];
  return segment || 'dashboard';
}

export default function AdminLayout({ children }) {
  const { user, logout, loading: authLoading } = useAuth();
  const { unreadCount: chatUnread, fetchUnreadCount } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login?redirect=/admin');
      } else if (user.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchUnreadCount();
  }, [user?.role, fetchUnreadCount]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fffafb] flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <Loader2 className="w-12 h-12 animate-spin text-rose-800" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Loading admin...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#fffafb] text-rose-950 font-sans antialiased selection:bg-rose-200 selection:text-rose-900">
      <aside className="w-64 border-r border-pink-100/70 bg-white flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 z-50">
        <div className="p-6 space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-black text-rose-950 flex items-center gap-2">
              <span className="p-1.5 bg-rose-900 text-white rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              Chadani
            </h1>
            <p className="text-[9px] text-rose-900/40 font-black uppercase tracking-[0.25em] pl-1">
              Admin Suite
            </p>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-900 text-white shadow-lg shadow-rose-900/10'
                      : 'text-rose-950/60 hover:text-rose-950 hover:bg-pink-50/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.href === '/admin/messages' && chatUnread > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-[9px] font-black flex items-center justify-center">
                      {chatUnread > 9 ? '9+' : chatUnread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-pink-50 bg-pink-50/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 bg-rose-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="font-extrabold text-xs text-rose-950 block truncate">{user.name}</span>
              <span className="text-[10px] text-rose-900/40 font-bold block">Administrator</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="px-10 py-5 bg-white border-b border-pink-100/50 flex items-center justify-between flex-shrink-0 z-40 shadow-sm shadow-pink-100/5">
          <div className="flex items-center gap-2 text-rose-950/40 text-xs font-bold capitalize">
            <span>Admin</span>
            <span>/</span>
            <span className="text-rose-950 font-black tracking-wide">{breadcrumbLabel(pathname)}</span>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="p-10 max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
