'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Package, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

function formatNotificationTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const handleNotificationClick = (notification) => {
    if (!notification.read) markAsRead(notification.id);
    setOpen(false);

    if (notification.orderId) {
      const orderId = notification.orderId;
      if (pathname === '/account/orders') {
        window.dispatchEvent(
          new CustomEvent('orders:highlight', { detail: { orderId } })
        );
        router.replace(`/account/orders?orderId=${encodeURIComponent(orderId)}`);
      } else {
        router.push(`/account/orders?orderId=${encodeURIComponent(orderId)}`);
      }
      return;
    }

    router.push('/account/orders');
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen) fetchNotifications();
        }}
        className={`relative p-2 rounded transition-colors cursor-pointer ${
          open
            ? 'text-brand-dark bg-brand-bg'
            : 'text-brand-text/75 hover:text-brand-dark hover:bg-brand-bg/50'
        }`}
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[15px] h-3.5 px-0.5 text-[8px] font-semibold text-white bg-brand-dark rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Notifications menu"
          className="
            fixed inset-0 z-[100] bg-brand-surface flex flex-col animate-fadeIn
            sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-[22rem] sm:border sm:border-brand-border sm:shadow-xl sm:block sm:h-auto
          "
          style={{ height: '100dvh' }} // ensure mobile full height
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border/60 bg-brand-bg/40 sticky top-0 shrink-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-dark">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[9px] font-medium text-brand-accent hover:text-brand-dark uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </button>
              )}
              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sm:hidden text-brand-muted hover:text-brand-dark cursor-pointer"
                aria-label="Close notifications"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 sm:max-h-80 overflow-y-auto divide-y divide-brand-border/40 overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="py-10 flex justify-center text-brand-muted">
                <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-10 text-center text-xs text-brand-muted px-4 leading-relaxed">
                No notifications yet. Order status updates will appear here.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-brand-bg/60 transition-colors cursor-pointer ${
                    !n.read ? 'bg-brand-bg/30' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded bg-brand-bg border border-brand-border text-brand-accent shrink-0 mt-0.5">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-serif font-medium text-brand-dark leading-snug">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-brand-muted font-normal mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-brand-muted font-mono mt-1">
                        {formatNotificationTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-brand-border/60 bg-brand-bg/40 shrink-0">
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="block text-center text-[10px] font-medium uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-colors"
            >
              View all orders &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
