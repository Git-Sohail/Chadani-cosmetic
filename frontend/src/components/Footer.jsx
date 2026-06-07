'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';
import Button from './Button';
import Logo from './Logo';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-pink-950 text-pink-100 border-t border-pink-900/50">
      {/* Top Newsletter & Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 border-b border-pink-900/40">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-300" />
              Subscribe to Chadani Cosmetic
            </h3>
            <p className="text-pink-200/80 text-sm max-w-xl">
              Get the latest updates, special deals, beauty insights, and style recommendations delivered directly to your inbox. Take 10% off your first order!
            </p>
          </div>
          <div className="flex items-center">
            <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-full bg-pink-900/30 border border-pink-800 text-white placeholder-pink-300/50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                required
              />
              <Button type="submit" variant="secondary" size="md" className="shrink-0 bg-rose-300 hover:bg-rose-400 text-rose-950 border-rose-300">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Navigation & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 text-sm">
          {/* Logo & About */}
          <div className="space-y-4">
            <Logo size="lg" href="/" className="brightness-110" />
            <p className="text-pink-200/70 leading-relaxed">
              Bringing you premium quality skincare treatments, beauty cosmetics, and handcrafted bangles. Pamper yourself with the elegance you deserve.
            </p>
            <div className="pt-2">
              <p className="text-pink-200/50 text-[10px] font-bold uppercase tracking-widest">Follow Our Journey</p>
              <div className="flex space-x-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-pink-900/40 flex items-center justify-center text-pink-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-pink-900/40 flex items-center justify-center text-pink-300">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-pink-200/80">
              <li><Link href="/shop?category=skincare" className="hover:text-white transition-colors">Skincare Treatment</Link></li>
              <li><Link href="/shop?category=makeup" className="hover:text-white transition-colors">Cosmetics & Makeup</Link></li>
              <li><Link href="/shop?category=bangles" className="hover:text-white transition-colors">Traditional Bangles</Link></li>
              <li><Link href="/shop?category=jewellery" className="hover:text-white transition-colors">Artificial Jewellery</Link></li>
              <li><Link href="/shop?category=hair-accessories" className="hover:text-white transition-colors">Hair Accessories</Link></li>
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Customer Services</h4>
            <ul className="space-y-2.5 text-pink-200/80">
              <li><Link href="#" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="text-white font-semibold text-base mb-4">Store Location</h4>
            <div className="flex items-start gap-2.5 text-pink-200/80">
              <MapPin className="w-5 h-5 shrink-0 text-rose-300" />
              <span>123 Elegance Lane, Beauty Plaza, Floor 2, NY</span>
            </div>
            <div className="flex items-center gap-2.5 text-pink-200/80">
              <Phone className="w-4 h-4 text-rose-300" />
              <span>+1 (234) 567-890</span>
            </div>
            <div className="flex items-center gap-2.5 text-pink-200/80">
              <Mail className="w-4 h-4 text-rose-300" />
              <span>support@chadanicosmetic.com</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="border-t border-pink-900/40 pt-8 text-center text-xs text-pink-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} Chadani Cosmetic. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> for your beauty journey.
          </p>
        </div>
      </div>
    </footer>
  );
}
