'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X, Search, Sparkles, LogOut, MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { resolveImageUrl } from '../utils/imageUrl';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Integrated States from Contexts
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { openChatWidget, unreadCount: chatUnread } = useChat();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isLoggedIn = !!user;
  const userRole = user?.role || 'customer';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/#collections' },
    { name: 'Reviews', href: '/#reviews' },
  ];

  // Never render store navigation on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-pink-100/20 py-3 border-b border-pink-50' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <img
                src="/Logo.png"
                alt="Chandani Cosmetic"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-black uppercase tracking-widest transition-all duration-300 relative py-2 ${
                    isActive 
                      ? 'text-rose-900' 
                      : 'text-rose-950/50 hover:text-rose-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-rose-900 rounded-full animate-fadeIn" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Search - Placeholder for functionality */}
            <button className="text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all">
              <Search className="w-5 h-5" />
            </button>

            {isLoggedIn && userRole !== 'admin' && <NotificationBell />}

            {isLoggedIn && userRole === 'customer' && (
              <button
                type="button"
                onClick={openChatWidget}
                className="relative text-rose-950/50 hover:text-rose-900 p-2.5 rounded-xl hover:bg-pink-50 transition-all"
                aria-label="Open support chat"
                title="Support Chat"
              >
                <MessageCircle className="w-5 h-5" />
                {chatUnread > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-rose-700 rounded-full ring-2 ring-white">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-rose-950/50 hover:text-rose-900 transition-all p-2.5 rounded-xl hover:bg-pink-50 group">
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-600 text-rose-600' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-700 rounded-full ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-rose-950/50 hover:text-rose-900 transition-all p-2.5 rounded-xl hover:bg-pink-50 group">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-700 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown / Actions */}
            <div className="pl-4 border-l border-pink-100 flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {userRole !== 'admin' && (
                    <Link
                      href="/profile"
                      className="w-9 h-9 rounded-full overflow-hidden border-2 border-rose-900/20 ring-2 ring-white shadow-md bg-rose-900 text-white flex items-center justify-center text-sm font-black shrink-0"
                      title="Your profile"
                    >
                      {resolveImageUrl(user.profileImage) ? (
                        <img
                          src={resolveImageUrl(user.profileImage)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0)
                      )}
                    </Link>
                  )}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
                      Hi, {user.name.split(' ')[0]}
                    </span>
                    {userRole === 'admin' ? (
                      <Link href="/admin" className="text-[8px] font-black text-rose-600 uppercase tracking-[0.2em] hover:underline mt-0.5">
                        Dashboard
                      </Link>
                    ) : (
                      <div className="flex gap-2 mt-0.5">
                        <Link href="/profile" className="text-[8px] font-black text-rose-600 uppercase tracking-[0.2em] hover:underline">
                          Profile
                        </Link>
                        <span className="text-[8px] text-pink-200">|</span>
                        <Link href="/orders" className="text-[8px] font-black text-rose-600 uppercase tracking-[0.2em] hover:underline">
                          Orders
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-rose-950/50 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="sm" className="px-6 py-2.5 rounded-xl shadow-lg shadow-rose-900/10">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <Link href="/cart" className="relative text-rose-950/70 p-2.5">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-700 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-rose-950 hover:bg-pink-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-pink-50 animate-fadeIn fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto">
          <div className="px-6 pt-8 pb-12 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em]">Menu</p>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 text-2xl font-serif font-black transition-colors ${
                      isActive ? 'text-rose-600' : 'text-rose-950'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="pt-8 border-t border-pink-50 space-y-6">
              <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em]">Account</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl text-rose-950 font-bold">
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </Link>
                <Link href="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl text-rose-950 font-bold">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Cart</span>
                </Link>
              </div>

              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-pink-100 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-rose-950 uppercase">{user.name}</span>
                      <span className="text-[10px] font-bold text-rose-900/50">{user.email}</span>
                    </div>
                    {userRole === 'admin' ? (
                      <Link href="/admin" onClick={() => setIsOpen(false)} className="px-3 py-1 bg-rose-900 text-white text-[8px] font-black uppercase rounded-lg">
                        Admin
                      </Link>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Link href="/profile" onClick={() => setIsOpen(false)} className="px-2.5 py-1 bg-rose-50 border border-pink-100 text-rose-900 text-[8px] font-black uppercase rounded-lg">
                          Profile
                        </Link>
                        <Link href="/orders" onClick={() => setIsOpen(false)} className="px-2.5 py-1 bg-rose-50 border border-pink-100 text-rose-900 text-[8px] font-black uppercase rounded-lg">
                          Orders
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            openChatWidget();
                          }}
                          className="px-2.5 py-1 bg-rose-900 text-white text-[8px] font-black uppercase rounded-lg"
                        >
                          Chat
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 text-red-600 font-black uppercase tracking-widest text-xs border-2 border-red-50 rounded-2xl"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
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
    </nav>
  );
}
