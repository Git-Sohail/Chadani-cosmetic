'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Search,
  LogOut,
  MessageCircle,
  ChevronDown,
  User,
  Package,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { resolveImageUrl } from '../utils/imageUrl';
import Button from './Button';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { openChatWidget, unreadCount: chatUnread } = useChat();

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    setIsOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isLoggedIn = !!user;
  const userRole = user?.role || 'customer';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    };

    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/#collections' },
    { name: 'Reviews', href: '/#reviews' },
  ];

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Subtle Announcement Strip with accurate delivery messaging */}
        <div className="hidden sm:block bg-brand-surface border-b border-brand-border-subtle py-1.5 text-center text-[10px] sm:text-[11px] font-sans tracking-[0.22em] uppercase text-brand-muted">
          Dharan Delivery &bull; Flat Rs. 100 &bull; Cash on Delivery Available
        </div>

        {/* Main Navbar */}
        <nav
          className={`transition-all duration-300 ${
            scrolled
              ? 'bg-brand-surface/95 backdrop-blur-md border-b border-brand-border/80 shadow-xs'
              : 'bg-brand-surface/90 backdrop-blur-sm border-b border-brand-border/40'
          } h-[var(--nav-height-mobile)] lg:h-[var(--nav-height-desktop)]`}
        >
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full gap-4 lg:gap-8">
              {/* Logo */}
              <div className="flex shrink-0 items-center min-w-0">
                <Logo size="lg" href="/" />
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-8 xl:gap-10 min-w-0">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`shrink-0 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 relative py-1 whitespace-nowrap ${
                        isActive
                          ? 'text-brand-dark'
                          : 'text-brand-muted hover:text-brand-dark'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-accent rounded-full animate-fadeIn" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-3.5 xl:gap-4 shrink-0">
                {/* Search interaction */}
                {searchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded px-3 py-1.5 shadow-2xs animate-fadeIn"
                  >
                    <Search className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchOpen(false);
                      }}
                      placeholder="Search cosmetics..."
                      className="w-40 xl:w-56 text-xs text-brand-text placeholder:text-brand-muted/50 bg-transparent focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="text-[10px] font-medium text-brand-dark hover:text-brand-accent uppercase tracking-wider px-1 cursor-pointer"
                    >
                      Go
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="text-brand-muted hover:text-brand-dark p-0.5 transition-colors cursor-pointer"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="text-brand-text/75 hover:text-brand-dark p-2 rounded transition-colors cursor-pointer"
                    aria-label="Search collection"
                    title="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}

                {/* Notification Bell */}
                {isLoggedIn && userRole !== 'admin' && <NotificationBell />}

                {/* Customer Chat */}
                {isLoggedIn && userRole === 'customer' && (
                  <button
                    type="button"
                    onClick={openChatWidget}
                    className="relative text-brand-text/75 hover:text-brand-dark p-2 rounded transition-colors cursor-pointer"
                    aria-label="Open support chat"
                    title="Support Chat"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatUnread > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[15px] h-3.5 px-0.5 text-[8px] font-semibold text-white bg-brand-dark rounded-full">
                        {chatUnread > 9 ? '9+' : chatUnread}
                      </span>
                    )}
                  </button>
                )}

                {/* Wishlist */}
                <Link
                  href="/account/wishlist"
                  className="relative text-brand-text/75 hover:text-brand-dark p-2 rounded transition-colors"
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-brand-accent text-brand-accent' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[15px] h-3.5 px-0.5 text-[8px] font-semibold text-white bg-brand-dark rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative text-brand-text/75 hover:text-brand-dark p-2 rounded transition-colors"
                  aria-label="Shopping Cart"
                  title="Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[15px] h-3.5 px-0.5 text-[8px] font-semibold text-white bg-brand-dark rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Session / Sign In */}
                <div className="pl-2.5 border-l border-brand-border/60 flex items-center">
                  {isLoggedIn ? (
                    <div className="relative" ref={accountMenuRef}>
                      <button
                        type="button"
                        onClick={() => setAccountMenuOpen((prev) => !prev)}
                        aria-expanded={accountMenuOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-2 py-1 px-1.5 rounded text-brand-dark hover:text-brand-accent transition-colors cursor-pointer group"
                      >
                        <Avatar
                          src={user.profileImage}
                          name={user.name}
                          size="sm"
                          className="group-hover:border-brand-accent transition-colors"
                        />
                        <span className="text-[11px] font-medium tracking-wider uppercase truncate max-w-[110px] text-brand-dark">
                          {user.name?.split(' ')[0] || 'Account'}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${
                            accountMenuOpen ? 'rotate-180 text-brand-dark' : ''
                          }`}
                        />
                      </button>

                      {/* Account Dropdown */}
                      {accountMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-2 w-64 bg-brand-surface border border-brand-border shadow-lg py-2 z-[100] animate-fadeIn"
                        >
                          {/* Identity Header */}
                          <div className="px-4 py-3 border-b border-brand-border/60 space-y-0.5">
                            <p className="text-xs font-medium text-brand-dark truncate">{user.name}</p>
                            <p className="text-[11px] text-brand-muted font-mono truncate">{user.email}</p>
                            {userRole === 'admin' && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-brand-dark text-brand-surface">
                                Administrator
                              </span>
                            )}
                          </div>

                          {/* Links */}
                          <div className="py-1">
                            {userRole === 'admin' ? (
                              <Link
                                href="/admin"
                                onClick={() => setAccountMenuOpen(false)}
                                role="menuitem"
                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text hover:bg-brand-bg hover:text-brand-dark transition-colors"
                              >
                                <LayoutDashboard className="w-3.5 h-3.5 text-brand-accent" />
                                <span>Admin Dashboard</span>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  href="/account"
                                  onClick={() => setAccountMenuOpen(false)}
                                  role="menuitem"
                                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                >
                                  <User className="w-3.5 h-3.5 text-brand-accent" />
                                  <span>Overview</span>
                                </Link>
                                <Link
                                  href="/account/orders"
                                  onClick={() => setAccountMenuOpen(false)}
                                  role="menuitem"
                                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                >
                                  <Package className="w-3.5 h-3.5 text-brand-accent" />
                                  <span>My Orders</span>
                                </Link>
                                <Link
                                  href="/account/wishlist"
                                  onClick={() => setAccountMenuOpen(false)}
                                  role="menuitem"
                                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                >
                                  <Heart className="w-3.5 h-3.5 text-brand-accent" />
                                  <span>Wishlist ({wishlistCount})</span>
                                </Link>
                                <Link
                                  href="/account/settings"
                                  onClick={() => setAccountMenuOpen(false)}
                                  role="menuitem"
                                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text hover:bg-brand-bg hover:text-brand-dark transition-colors"
                                >
                                  <Settings className="w-3.5 h-3.5 text-brand-accent" />
                                  <span>Settings</span>
                                </Link>
                              </>
                            )}
                          </div>

                          {/* Sign Out */}
                          <div className="border-t border-brand-border/60 pt-1 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAccountMenuOpen(false);
                                logout();
                              }}
                              role="menuitem"
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-brand-muted hover:text-brand-dark hover:bg-brand-bg transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5 text-brand-muted" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button variant="primary" size="sm" className="px-4 py-1.5 text-[11px] tracking-[0.16em] uppercase">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Right Controls */}
              <div className="flex items-center lg:hidden gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="p-2 text-brand-text hover:text-brand-accent transition-colors cursor-pointer"
                  aria-label="Search collection"
                >
                  <Search className="h-4.5 w-4.5" />
                </button>
                <Link href="/cart" className="relative p-2 text-brand-text hover:text-brand-accent transition-colors" aria-label="Shopping Cart">
                  <ShoppingBag className="h-4.5 w-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[15px] h-3.5 px-0.5 text-[8px] font-semibold text-white bg-brand-dark rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 text-brand-text hover:text-brand-accent transition-colors cursor-pointer"
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isOpen}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-brand-surface/98 backdrop-blur-xl border-t border-brand-border animate-fadeIn overflow-y-auto"
          style={{ top: 'var(--nav-height-mobile)' }}
        >
          <div className="px-6 pt-6 pb-12 space-y-7 max-w-lg mx-auto">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cosmetics, skincare..."
                className="w-full pl-10 pr-14 py-2.5 bg-brand-bg border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-2.5 py-1 bg-brand-dark text-brand-surface text-[10px] font-medium rounded uppercase tracking-wider cursor-pointer"
              >
                Go
              </button>
            </form>

            {/* Navigation Links */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase">Navigation</p>
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-1.5 font-serif text-2xl transition-colors ${
                        isActive ? 'text-brand-accent' : 'text-brand-dark hover:text-brand-accent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Access Badges */}
            <div className="pt-4 border-t border-brand-border space-y-4">
              <p className="text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase">Quick Access</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-3 bg-brand-bg border border-brand-border/60 rounded text-xs text-brand-text hover:border-brand-accent transition-colors"
                >
                  <Heart className="w-4 h-4 text-brand-accent" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-3 bg-brand-bg border border-brand-border/60 rounded text-xs text-brand-text hover:border-brand-accent transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-accent" />
                  <span>Cart ({cartCount})</span>
                </Link>
              </div>

              {/* User Account / Sign In */}
              {isLoggedIn ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-brand-bg border border-brand-border rounded space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profileImage} name={user.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-brand-dark uppercase tracking-wider truncate">{user.name}</p>
                        <p className="text-[11px] text-brand-muted font-mono truncate">{user.email}</p>
                      </div>
                      {userRole === 'admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1 bg-brand-dark text-brand-surface text-[10px] font-medium rounded uppercase tracking-wider shrink-0"
                        >
                          Admin
                        </Link>
                      ) : null}
                    </div>

                    {userRole !== 'admin' && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-brand-border/50 text-xs">
                        <Link
                          href="/account"
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded text-[10px] uppercase tracking-wider text-brand-text hover:border-brand-accent"
                        >
                          Overview
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded text-[10px] uppercase tracking-wider text-brand-text hover:border-brand-accent"
                        >
                          Orders
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded text-[10px] uppercase tracking-wider text-brand-text hover:border-brand-accent"
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded text-[10px] uppercase tracking-wider text-brand-text hover:border-brand-accent"
                        >
                          Settings
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            openChatWidget();
                          }}
                          className="px-2.5 py-1 bg-brand-dark text-brand-surface rounded text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Support Chat
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-brand-muted hover:text-brand-dark text-xs uppercase tracking-wider border border-brand-border rounded cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" fullWidth size="md" className="py-3 text-xs tracking-[0.18em] uppercase">
                      Sign In to Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
