'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';
import axios from 'axios';
import { Package, Heart, ShoppingBag, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';
import { getOrderStatusStyles, getOrderStatusLabel } from '../../../utils/orderStatus';

export default function AccountDashboardPage() {
  const { user, token, API_URL } = useAuth();
  const { wishlistItems } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus?.toLowerCase()));
  const recentOrders = orders.slice(0, 3);

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: Package,
      href: '/account/orders',
      caption: 'Lifetime order count',
    },
    {
      label: 'Active Dispatches',
      value: activeOrders.length,
      icon: ShoppingBag,
      href: '/account/orders',
      caption: 'In-progress deliveries',
    },
    {
      label: 'Saved in Wishlist',
      value: wishlistItems.length,
      icon: Heart,
      href: '/account/wishlist',
      caption: 'Curated beauty items',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Welcome Header */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
          Account Overview
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal">
          Welcome back, {user?.name?.split(' ')[0] || 'Customer'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1.5 leading-relaxed max-w-xl">
          Track your orders in Dharan, manage your account details, and view your curated beauty wishlist.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, caption }) => (
          <Link
            key={label}
            href={href}
            className="bg-brand-surface border border-brand-border p-5 hover:border-brand-accent transition-colors group flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between text-brand-muted">
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                {label}
              </span>
              <Icon className="w-4 h-4 text-brand-accent" />
            </div>
            <div>
              <p className="font-serif text-3xl font-normal text-brand-dark mt-2">{value}</p>
              <p className="text-[10px] text-brand-muted mt-0.5">{caption}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-brand-surface border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/60">
          <div>
            <h2 className="font-serif text-base text-brand-dark font-medium">Recent Orders</h2>
            <span className="text-[10px] text-brand-muted">Latest purchases for delivery in Dharan</span>
          </div>
          <Link
            href="/account/orders"
            className="text-xs uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 text-brand-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
            <span className="text-xs font-mono uppercase tracking-widest">Loading orders...</span>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-14 px-6 space-y-3">
            <Package className="w-8 h-8 text-brand-muted/40 mx-auto" />
            <h3 className="font-serif text-base text-brand-dark">No orders placed yet</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
              Explore our catalogue of premium traditional bangles, skincare remedies, and beauty essentials.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors"
              >
                <span>Browse Catalogue</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/60">
            {recentOrders.map((order) => {
              const firstItem = order.orderItems?.[0] || order.products?.[0];
              const totalItemCount = order.orderItems?.length || order.products?.length || 1;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-bg/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative w-14 aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                      {firstItem?.productImage ? (
                        <Image
                          src={firstItem.productImage}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-[10px] text-brand-muted/50 italic">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="font-serif text-sm sm:text-base text-brand-dark truncate">
                        {firstItem?.productName || 'Cosmetics Order'}
                        {totalItemCount > 1 && (
                          <span className="text-xs text-brand-muted font-sans font-normal ml-1">
                            +{totalItemCount - 1} more
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-brand-muted font-mono">
                        #{order.id.slice(0, 8).toUpperCase()} &bull;{' '}
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                    <div className="text-left sm:text-right space-y-1">
                      <p className="font-medium text-sm text-brand-dark">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${getOrderStatusStyles(
                          order.orderStatus
                        )}`}
                      >
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                    </div>

                    <Link
                      href={`/account/orders?orderId=${order.id}`}
                      className="p-2 border border-brand-border bg-brand-surface hover:border-brand-accent transition-colors text-brand-muted hover:text-brand-dark shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="View order details"
                      aria-label={`View order ${order.id}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/settings"
          className="p-5 bg-brand-surface border border-brand-border hover:border-brand-accent transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-sm text-brand-dark font-medium">Profile & Security</h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Update contact info, profile photo, or password
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-brand-muted" />
        </Link>

        <Link
          href="/account/wishlist"
          className="p-5 bg-brand-surface border border-brand-border hover:border-brand-accent transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-sm text-brand-dark font-medium">Saved Wishlist</h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Review products saved for future purchases
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-brand-muted" />
        </Link>
      </div>
    </div>
  );
}
