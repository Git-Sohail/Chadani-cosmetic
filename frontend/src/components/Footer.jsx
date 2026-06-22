'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, Share2, Globe } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-luxury-pink border-t border-luxury-rose-gold/15 text-luxury-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-luxury-rose-gold/15">
          <div className="space-y-4 lg:col-span-1">
            <Logo size="lg" href="/" />
            <p className="text-sm text-luxury-text/55 font-light leading-relaxed max-w-xs">
              Premium skincare, luxury cosmetics, and artisan jewellery.
            </p>
            <div className="flex gap-2.5">
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-luxury-rose-gold/20 flex items-center justify-center text-luxury-burgundy hover:bg-luxury-burgundy hover:text-white transition-colors" aria-label="Social">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-luxury-rose-gold/20 flex items-center justify-center text-luxury-burgundy hover:bg-luxury-burgundy hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base text-luxury-text mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-luxury-text/60 font-light">
              <li><Link href="/" className="hover:text-luxury-burgundy transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-luxury-burgundy transition-colors">Shop</Link></li>
              <li><Link href="/#collections" className="hover:text-luxury-burgundy transition-colors">Collections</Link></li>
              <li><Link href="/#reviews" className="hover:text-luxury-burgundy transition-colors">Reviews</Link></li>
              <li><Link href="/wishlist" className="hover:text-luxury-burgundy transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base text-luxury-text mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-luxury-text/60 font-light">
              <li><Link href="#" className="hover:text-luxury-burgundy transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-luxury-burgundy transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="#" className="hover:text-luxury-burgundy transition-colors">Returns</Link></li>
              <li><Link href="/orders" className="hover:text-luxury-burgundy transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-base text-luxury-text mb-4">Contact</h4>
            <div className="flex items-start gap-2.5 text-sm text-luxury-text/60 font-light">
              <MapPin className="w-4 h-4 shrink-0 text-luxury-rose-gold mt-0.5" />
              <span>Dharan, Sunsari, Nepal</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-luxury-text/60 font-light">
              <Phone className="w-4 h-4 shrink-0 text-luxury-rose-gold" />
              <span>+977 9800000000</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-luxury-text/60 font-light">
              <Mail className="w-4 h-4 shrink-0 text-luxury-rose-gold" />
              <span>support@chadanicosmetic.com</span>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5">
              {['Visa', 'Mastercard', 'eSewa', 'Khalti'].map((pay) => (
                <span key={pay} className="px-2.5 py-1 rounded-md bg-white border border-luxury-rose-gold/15 text-[9px] font-medium text-luxury-text/50 uppercase tracking-wider">
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-luxury-text/40">
          <p>© {currentYear} Chadani Cosmetic. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-light">
            Made with <Heart className="w-3.5 h-3.5 fill-luxury-rose-gold text-luxury-rose-gold" /> for your beauty journey
          </p>
        </div>
      </div>
    </footer>
  );
}
