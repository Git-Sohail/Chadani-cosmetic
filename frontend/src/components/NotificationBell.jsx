'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Package, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

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
      if (pathname === '/orders') {
        window.dispatchEvent(
          new CustomEvent('orders:highlight', { detail: { orderId } })
        );
        router.replace(`/orders?orderId=${encodeURIComponent(orderId)}`);
      } else {
        router.push(`/orders?orderId=${encodeURIComponent(orderId)}`);
      }
      return;
    }

    router.push('/orders');
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen) fetchNotifications();
        }}
        className="relative text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] bg-white border border-pink-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-pink-50 bg-pink-50/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-950">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[9px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-10 flex justify-center text-rose-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-10 text-center text-xs font-semibold text-rose-900/40 px-4">
                No notifications yet. Order updates will appear here.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-pink-50/80 hover:bg-pink-50/50 transition-colors ${
                    !n.read ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="p-2 rounded-xl bg-pink-100 text-rose-800 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-rose-950">{n.title}</p>
                      <p className="text-[11px] text-rose-900/70 font-medium mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-rose-900/40 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-pink-50 bg-pink-50/20">
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="block text-center text-[10px] font-black uppercase tracking-widest text-rose-800 hover:text-rose-950"
            >
              View all orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
