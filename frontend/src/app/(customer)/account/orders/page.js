'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { Package, Loader2, ChevronRight } from 'lucide-react';
import { formatPrice } from '../../../../utils/currency';
import { getOrderStatusStyles, getOrderStatusLabel } from '../../../../utils/orderStatus';

const FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AccountOrdersPage() {
  const { token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [API_URL, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[1.5rem] border border-pink-100 p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-rose-950 flex items-center gap-2">
          <Package className="w-6 h-6 text-[#7A003C]" /> My Orders
        </h1>
        <p className="text-xs text-rose-900/50 font-medium mt-1">{orders.length} orders total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
              filter === key ? 'bg-[#7A003C] text-white border-[#7A003C]' : 'bg-white text-rose-900/60 border-pink-100 hover:border-rose-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] border border-pink-100 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-rose-200 mx-auto mb-4" />
          <p className="font-black text-rose-950">No orders found</p>
          <Link href="/shop" className="inline-block mt-5 px-6 py-2.5 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#5a002c] transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const items = order.orderItems || order.products || [];
            return (
              <div key={order.id} className="bg-white rounded-[1.5rem] border border-pink-100 p-5 shadow-sm hover:shadow-md transition-all">
                {/* Order meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-pink-50">
                  <div>
                    <p className="text-[10px] font-black text-rose-900/40 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono font-black text-sm text-rose-950">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-900/40 uppercase tracking-widest">Date</p>
                    <p className="text-xs font-bold text-rose-950">{new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-900/40 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-[#7A003C]">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getOrderStatusStyles(order.orderStatus)}`}>
                    {getOrderStatusLabel(order.orderStatus)}
                  </span>
                </div>

                {/* Product thumbnails */}
                <div className="flex flex-wrap gap-3 items-center">
                  {items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 border border-pink-100 shrink-0">
                        {item.productImage
                          ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-rose-200" /></div>}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="text-[11px] font-bold text-rose-950 line-clamp-1">{item.productName}</p>
                        <p className="text-[9px] text-rose-900/40 font-semibold">×{item.quantity} · {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <span className="text-[10px] font-black text-rose-400">+{items.length - 4} more</span>
                  )}
                  <Link href={`/orders?orderId=${order.id}`}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 border border-pink-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-rose-900 hover:bg-pink-50 transition-colors shrink-0">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
