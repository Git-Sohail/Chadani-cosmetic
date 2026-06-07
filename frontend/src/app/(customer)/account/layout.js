'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { resolveImageUrl } from '../../../utils/imageUrl';
import {
  LayoutDashboard, Package, Heart, Settings, LogOut, ChevronRight, Loader2,
} from 'lucide-react';

const NAV = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: Package },
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#7A003C]" />
      </div>
    );
  }

  if (!user || user.role === 'admin') return null;

  const avatar = resolveImageUrl(user.profileImage);

  return (
    <div className="min-h-screen bg-[#FFF5F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-[1.5rem] border border-pink-100 shadow-sm overflow-hidden sticky top-28">
              {/* User card */}
              <div className="bg-gradient-to-br from-[#7A003C] to-[#B76E79] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center font-black text-lg shrink-0">
                    {avatar
                      ? <img src={avatar} alt="" className="w-full h-full object-cover" />
                      : user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="p-2">
                {NAV.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        active
                          ? 'bg-[#FFF5F7] text-[#7A003C] border border-pink-100'
                          : 'text-rose-950/60 hover:bg-pink-50 hover:text-rose-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-[#B76E79]" />}
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-1"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
