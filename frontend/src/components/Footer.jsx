'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Banknote, Heart } from 'lucide-react';
import Logo from './Logo';
import { useChat } from '../context/ChatContext';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { openChatWidget } = useChat();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-brand-dark text-brand-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-brand-surface/10">

          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4 lg:col-span-4">
            <div className="opacity-90">
              <Logo size="lg" href="/" />
            </div>
            <p className="text-xs sm:text-sm text-brand-surface/60 font-normal leading-relaxed max-w-sm">
              Chadani Cosmetic is a boutique destination for verified skincare treatments, daily cosmetics, and artisan traditional jewelry in Dharan, Nepal.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 border border-brand-surface/15 bg-brand-surface/5 text-[11px] text-brand-surface/70">
                <Banknote className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Dharan Delivery &bull; Flat Rs. 100 &bull; Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Col 2: Boutique & Shop */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-surface/90">
              Boutique
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-surface/55">
              <li><Link href="/" className="hover:text-brand-surface transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-brand-surface transition-colors">All Products</Link></li>
              <li><Link href="/#collections" className="hover:text-brand-surface transition-colors">Departments</Link></li>
              <li><Link href="/#reviews" className="hover:text-brand-surface transition-colors">Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-surface/90">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-surface/55">
              <li><Link href="/account/orders" className="hover:text-brand-surface transition-colors">Track Orders</Link></li>
              <li><Link href="/cart" className="hover:text-brand-surface transition-colors">Shopping Bag</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-brand-surface transition-colors">Saved Wishlist</Link></li>
              <li>
                <button
                  type="button"
                  onClick={openChatWidget}
                  className="hover:text-brand-surface transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-brand-terracotta" />
                  <span>Live Support Chat</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-surface/90">
              Store Location
            </h4>
            <div className="space-y-2.5 text-xs text-brand-surface/55">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 text-brand-terracotta mt-0.5" />
                <span>Dharan, Sunsari, Koshi Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-brand-terracotta" />
                <span>support@chadanicosmetic.com</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[11px] text-brand-surface/40 leading-relaxed">
                Direct doorstep dispatch across all wards in Dharan (Flat Rs. 100). Cash on Delivery available upon arrival.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-brand-surface/35">
          <p>&copy; {currentYear} Chadani Cosmetic. All rights reserved.</p>
          <p className="font-serif italic flex items-center gap-1.5 text-brand-surface/30">
            Made with <Heart className="w-3 h-3 text-brand-terracotta inline fill-current" /> in Dharan, Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
