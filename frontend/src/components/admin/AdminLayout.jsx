'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FileSpreadsheet,
  MessageSquare,
  LogOut,
  Loader2,
  Menu,
  X,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Logo from '../Logo';

const NAV_ITEMS = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, match: (p) => p === '/admin' },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag, match: (p) => p.startsWith('/admin/products') },
  { name: 'Collections', href: '/admin/categories', icon: Layers, match: (p) => p.startsWith('/admin/categories') || p.startsWith('/admin/collections') },
  { name: 'Orders', href: '/admin/orders', icon: FileSpreadsheet, match: (p) => p.startsWith('/admin/orders') },
  { name: 'Customers', href: '/admin/customers', icon: Users, match: (p) => p.startsWith('/admin/customers') },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, match: (p) => p.startsWith('/admin/messages') },
];

function breadcrumbLabel(pathname) {
  if (pathname === '/admin') return 'Overview';
  const segments = pathname.split('/').filter(Boolean);
  const segment = segments[1] || 'Overview';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function AdminLayout({ children }) {
  const { user, token, API_URL, logout, loading: authLoading } = useAuth();
  const { unreadCount: chatUnread, fetchUnreadCount, socket } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderUnreadCount, setOrderUnreadCount] = useState(0);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
    if (user?.role === 'admin') {
      fetchUnreadCount();
    }
  }, [user?.role, fetchUnreadCount]);

  // Fetch initial unread order count
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      axios.get(`${API_URL}/orders/new-count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setOrderUnreadCount(res.data.count || 0))
        .catch(err => console.error('Failed to fetch new order count:', err));
    }
  }, [user?.role, token, API_URL]);

  // Listen to new_order socket event
  useEffect(() => {
    if (!socket || user?.role !== 'admin') return;
    const handleNewOrder = () => {
      setOrderUnreadCount((prev) => prev + 1);
    };
    socket.on('new_order', handleNewOrder);
    return () => socket.off('new_order', handleNewOrder);
  }, [socket, user?.role]);

  // Clear unread order count when visiting orders section
  useEffect(() => {
    if (pathname.startsWith('/admin/orders') && orderUnreadCount > 0) {
      setOrderUnreadCount(0);
      axios.post(`${API_URL}/orders/new-count/reset`, null, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Failed to reset new order count:', err));
    }
  }, [pathname, orderUnreadCount, API_URL, token]);

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to exit the administration suite?')) {
      logout();
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center gap-3 text-brand-muted">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Authenticating administrator...
        </span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex bg-brand-bg text-brand-text font-sans antialiased">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-dark/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-brand-border bg-brand-surface flex-col justify-between shrink-0 h-screen sticky top-0 z-50">
        <SidebarContent
          pathname={pathname}
          chatUnread={chatUnread}
          orderUnreadCount={orderUnreadCount}
          user={user}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[min(100vw-3rem,18rem)] sm:w-72 bg-brand-surface border-r border-brand-border z-50 flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile administrative navigation"
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-dark transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent
          pathname={pathname}
          chatUnread={chatUnread}
          orderUnreadCount={orderUnreadCount}
          user={user}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Main content column */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Top Operational Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 h-16 bg-brand-surface/95 backdrop-blur-md border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 border border-brand-border text-brand-dark hover:border-brand-accent transition-colors lg:hidden shrink-0"
              aria-label="Open administrative navigation"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="lg:hidden shrink-0">
              <Logo size="sm" noLink />
            </div>

            <div className="flex items-center gap-2 text-xs text-brand-muted capitalize min-w-0">
              <span className="hidden sm:inline font-medium uppercase tracking-wider text-[11px]">
                Operations
              </span>
              <span className="hidden sm:inline text-brand-border" aria-hidden>/</span>
              <span className="text-brand-dark font-medium truncate">
                {breadcrumbLabel(pathname)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Storefront Link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-border bg-brand-surface hover:border-brand-accent text-[11px] font-medium uppercase tracking-wider text-brand-dark transition-colors"
              title="Open customer storefront in a new tab"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-brand-accent" />
            </Link>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
          <div className="max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, chatUnread, orderUnreadCount, user, handleLogout }) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <Logo size="md" href="/admin" />
          <span className="text-[9px] text-brand-accent font-medium uppercase tracking-[0.25em] block">
            Commerce Operations
          </span>
        </div>

        <nav className="space-y-1" role="navigation" aria-label="Admin modules">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-brand-dark text-brand-surface'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-brand-bg/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                <span>{item.name}</span>
                {item.href === '/admin/messages' && chatUnread > 0 && (
                  <span
                    className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-brand-accent text-brand-surface text-[9px] font-bold flex items-center justify-center font-mono"
                    aria-label={`${chatUnread} unread messages`}
                  >
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
                {item.href === '/admin/orders' && orderUnreadCount > 0 && (
                  <span
                    className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-brand-accent text-brand-surface text-[9px] font-bold flex items-center justify-center font-mono"
                    aria-label={`${orderUnreadCount} unread orders`}
                  >
                    {orderUnreadCount > 9 ? '9+' : orderUnreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-brand-border bg-brand-bg/40 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div
            className="w-8 h-8 bg-brand-dark text-brand-surface flex items-center justify-center font-serif text-sm font-semibold shrink-0"
            aria-hidden
          >
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="overflow-hidden min-w-0">
            <span className="font-medium text-xs text-brand-dark block truncate">
              {user?.name}
            </span>
            <span className="text-[10px] text-brand-muted uppercase tracking-widest block">
              Store Administrator
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-brand-border/60">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-brand-muted hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden />
            <span>Sign Out of Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
