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
    <footer className="bg-[#fff5f7] border-t border-[#c89b8f]/15 text-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-[#c89b8f]/15">
          <div className="space-y-5 lg:col-span-1">
            <Logo size="lg" href="/" className="bg-white/80 rounded-xl px-3 py-1.5 shadow-sm ring-1 ring-[#c89b8f]/15" />
            <p className="text-sm text-[#2a2a2a]/55 font-light leading-relaxed max-w-xs">
              Premium skincare, luxury cosmetics, and artisan jewellery — crafted for your natural glow.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#c89b8f]/20 flex items-center justify-center text-[#7a003c] hover:bg-[#7a003c] hover:text-white transition-colors" aria-label="Social">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#c89b8f]/20 flex items-center justify-center text-[#7a003c] hover:bg-[#7a003c] hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg text-[#2a2a2a] mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm text-[#2a2a2a]/60 font-light">
              <li><Link href="/" className="hover:text-[#7a003c] transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-[#7a003c] transition-colors">Shop</Link></li>
              <li><Link href="/#collections" className="hover:text-[#7a003c] transition-colors">Collections</Link></li>
              <li><Link href="/#reviews" className="hover:text-[#7a003c] transition-colors">Reviews</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#7a003c] transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-[#2a2a2a] mb-5">Customer Care</h4>
            <ul className="space-y-3 text-sm text-[#2a2a2a]/60 font-light">
              <li><Link href="#" className="hover:text-[#7a003c] transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-[#7a003c] transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="#" className="hover:text-[#7a003c] transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/orders" className="hover:text-[#7a003c] transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-[#7a003c] transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[#2a2a2a] mb-5">Contact</h4>
            <div className="flex items-start gap-3 text-sm text-[#2a2a2a]/60 font-light">
              <MapPin className="w-4 h-4 shrink-0 text-[#c89b8f] mt-0.5" />
              <span>Dharan, Sunsari, Nepal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#2a2a2a]/60 font-light">
              <Phone className="w-4 h-4 shrink-0 text-[#c89b8f]" />
              <span>+977 9800000000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#2a2a2a]/60 font-light">
              <Mail className="w-4 h-4 shrink-0 text-[#c89b8f]" />
              <span>support@chadanicosmetic.com</span>
            </div>
            <div className="pt-4 flex flex-wrap gap-2">
              {['Visa', 'Mastercard', 'eSewa', 'Khalti'].map((pay) => (
                <span key={pay} className="px-3 py-1.5 rounded-lg bg-white border border-[#c89b8f]/15 text-[10px] font-medium text-[#2a2a2a]/50 uppercase tracking-wider">
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2a2a2a]/40">
          <p>© {currentYear} Chadani Cosmetic. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-light">
            Made with <Heart className="w-3.5 h-3.5 fill-[#c89b8f] text-[#c89b8f]" /> for your beauty journey
          </p>
        </div>
      </div>
    </footer>
  );
}
