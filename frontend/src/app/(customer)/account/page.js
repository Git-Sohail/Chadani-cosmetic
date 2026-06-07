'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';
import axios from 'axios';
import { Package, Heart, ShoppingBag, ChevronRight, Loader2 } from 'lucide-react';
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
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [API_URL, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus));
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, href: '/account/orders', color: 'bg-rose-50 text-[#7A003C]' },
    { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, href: '/account/orders', color: 'bg-amber-50 text-amber-700' },
    { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, href: '/account/wishlist', color: 'bg-pink-50 text-pink-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-rose-950">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-rose-900/50 font-medium mt-1">
          Welcome back to Chadani Cosmetic
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="bg-white rounded-[1.5rem] border border-pink-100 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-700 transition-colors" />
            </div>
            <p className="text-3xl font-black text-rose-950 mt-3">{value}</p>
            <p className="text-xs font-bold text-rose-900/50 uppercase tracking-wider mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-50">
          <h2 className="font-black text-rose-950 text-sm uppercase tracking-widest">Recent Orders</h2>
          <Link href="/account/orders" className="text-[10px] font-black text-[#7A003C] uppercase tracking-wider hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Package className="w-10 h-10 text-rose-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-rose-950/50">No orders yet</p>
            <Link href="/shop" className="inline-block mt-4 px-5 py-2 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#5a002c] transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {recentOrders.map((order) => {
              const firstItem = order.orderItems?.[0] || order.products?.[0];
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-pink-50/30 transition-colors">
                  {/* Product image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 border border-pink-100 shrink-0">
                    {firstItem?.productImage
                      ? <img src={firstItem.productImage} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-rose-200" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-rose-950 truncate">
                      {firstItem?.productName || 'Order'}
                      {(order.orderItems?.length || order.products?.length) > 1 && (
                        <span className="text-rose-400 font-semibold"> +{(order.orderItems?.length || order.products?.length) - 1} more</span>
                      )}
                    </p>
                    <p className="text-[10px] text-rose-900/40 font-semibold mt-0.5">
                      #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-black text-rose-950">{formatPrice(order.totalAmount)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getOrderStatusStyles(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  <Link href={`/orders?orderId=${order.id}`}
                    className="ml-2 shrink-0 p-2 rounded-xl hover:bg-pink-100 transition-colors text-rose-400 hover:text-rose-700">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
