'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, Search, LogOut, MessageCircle, User, Package, Settings, ChevronDown } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { resolveImageUrl } from '../utils/imageUrl';
import Button from './Button';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

const ACCOUNT_MENU = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { openChatWidget, unreadCount: chatUnread } = useChat();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isLoggedIn = !!user;
  const userRole = user?.role || 'customer';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setDropdownOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/#collections' },
    { name: 'Reviews', href: '/#reviews' },
  ];

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-pink-200/40 border-b border-pink-100/80'
          : 'bg-white/70 backdrop-blur-md border-b border-pink-50/60'
      } h-[var(--nav-height-mobile)] lg:h-[var(--nav-height-desktop)]`}>
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full gap-3 lg:gap-6">

            {/* Logo */}
            <div className="flex shrink-0 items-center min-w-0">
              <Logo size="lg" />
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 min-w-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href}
                    className={`shrink-0 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 relative py-2 whitespace-nowrap ${
                      isActive ? 'text-rose-900' : 'text-rose-950/50 hover:text-rose-900'
                    }`}>
                    {link.name}
                    {isActive && <span className="absolute bottom-0 left-0 w-full h-1 bg-rose-900 rounded-full animate-fadeIn" />}
                  </Link>
                );
              })}
            </div>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
              <button type="button" className="text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn && userRole !== 'admin' && <NotificationBell />}

              {isLoggedIn && userRole === 'customer' && (
                <button type="button" onClick={openChatWidget}
                  className="relative text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all"
                  aria-label="Support chat">
                  <MessageCircle className="w-5 h-5" />
                  {chatUnread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white flex items-center justify-center">
                      {chatUnread > 9 ? '9+' : chatUnread}
                    </span>
                  )}
                </button>
              )}

              <Link href="/wishlist" className="relative text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all">
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-600 text-rose-600' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account dropdown */}
              <div className="pl-3 border-l border-pink-100 relative" ref={dropdownRef}>
                {isLoggedIn ? (
                  <>
                    <button type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 group cursor-pointer"
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#7A003C]/20 ring-2 ring-white shadow-md bg-[#7A003C] text-white flex items-center justify-center text-sm font-black shrink-0">
                        {resolveImageUrl(user.profileImage)
                          ? <img src={resolveImageUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
                          : user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      {userRole !== 'admin' && (
                        <div className="hidden xl:flex flex-col items-start">
                          <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest leading-none">
                            {user.name?.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-rose-900/40 font-semibold">My Account</span>
                        </div>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-rose-900/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl border border-pink-100 shadow-xl shadow-rose-900/10 overflow-hidden z-[60] animate-fadeIn">
                        {/* User header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-[#7A003C]/5 to-[#B76E79]/5 border-b border-pink-50">
                          <p className="text-xs font-black text-rose-950 truncate">{user.name}</p>
                          <p className="text-[10px] text-rose-900/50 truncate">{user.email}</p>
                        </div>

                        {userRole === 'admin' ? (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-950 hover:bg-pink-50 transition-colors">
                            <Settings className="w-4 h-4 text-[#7A003C]" />
                            Admin Dashboard
                          </Link>
                        ) : (
                          ACCOUNT_MENU.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-950 hover:bg-pink-50 transition-colors">
                              <Icon className="w-4 h-4 text-[#7A003C]" />
                              {label}
                            </Link>
                          ))
                        )}

                        <div className="border-t border-pink-50">
                          <button type="button" onClick={() => { setDropdownOpen(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="px-5 py-2.5 rounded-xl shadow-lg whitespace-nowrap">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile right */}
            <div className="flex items-center lg:hidden gap-1 shrink-0">
              <Link href="/cart" className="relative text-rose-950/70 p-2.5">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button type="button" onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-rose-950 hover:bg-pink-50 transition-colors"
                aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-pink-50 animate-fadeIn overflow-y-auto"
          style={{ top: 'var(--nav-height-mobile)' }}>
          <div className="px-6 pt-8 pb-12 space-y-8">
            {/* Nav links */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">Menu</p>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                    className={`block py-3 text-xl font-serif font-black transition-colors ${isActive ? 'text-[#7A003C]' : 'text-rose-950'}`}>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Account section */}
            <div className="border-t border-pink-50 pt-6 space-y-2">
              <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">My Account</p>

              {isLoggedIn ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#7A003C]/5 to-[#B76E79]/5 rounded-2xl border border-pink-100 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#7A003C] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {resolveImageUrl(user.profileImage)
                        ? <img src={resolveImageUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
                        : user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-rose-950 truncate">{user.name}</p>
                      <p className="text-[10px] text-rose-900/50 truncate">{user.email}</p>
                    </div>
                  </div>

                  {userRole === 'admin' ? (
                    <Link href="/admin" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-rose-950 hover:bg-pink-50 transition-colors">
                      <Settings className="w-4 h-4 text-[#7A003C]" /> Admin Dashboard
                    </Link>
                  ) : (
                    ACCOUNT_MENU.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href} onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-rose-950 hover:bg-pink-50 transition-colors">
                        <Icon className="w-4 h-4 text-[#7A003C]" />
                        {label}
                      </Link>
                    ))
                  )}

                  {userRole === 'customer' && (
                    <button type="button" onClick={() => { setIsOpen(false); openChatWidget(); }}
                      className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-rose-950 hover:bg-pink-50 transition-colors w-full">
                      <MessageCircle className="w-4 h-4 text-[#7A003C]" /> Support Chat
                      {chatUnread > 0 && <span className="ml-auto px-2 py-0.5 bg-rose-700 text-white text-[9px] font-black rounded-full">{chatUnread}</span>}
                    </button>
                  )}

                  <button type="button" onClick={() => { setIsOpen(false); logout(); }}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full mt-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" fullWidth size="lg" className="rounded-2xl py-4 shadow-xl shadow-rose-900/10">
                    Sign In to Store
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

