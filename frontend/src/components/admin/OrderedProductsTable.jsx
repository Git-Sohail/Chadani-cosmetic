'use client';

import React from 'react';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

function ProductThumbnail({ item, size = 'md', onPreview }) {
  const sizeClass =
    size === 'lg'
      ? 'w-36 h-36 sm:w-40 sm:h-40'
      : size === 'sm'
        ? 'w-16 h-16'
        : 'w-28 h-28 sm:w-32 sm:h-32';

  const imageUrl = item.productImage;
  const category = item.category || item.productCategory || 'General';

  return (
    <button
      type="button"
      onClick={() => imageUrl && onPreview?.(imageUrl, item.productName)}
      disabled={!imageUrl}
      className={`${sizeClass} rounded-2xl border-2 border-pink-100 bg-white overflow-hidden flex-shrink-0 relative group ${
        imageUrl ? 'cursor-zoom-in hover:border-rose-300 hover:shadow-lg' : 'cursor-default'
      } transition-all`}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute inset-0 bg-rose-950/0 group-hover:bg-rose-950/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
          </span>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-pink-50 text-pink-200 gap-1">
          <ImageIcon className="w-8 h-8" />
          <span className="text-[8px] font-black uppercase tracking-wider">No image</span>
        </div>
      )}
      <span className="absolute bottom-1 left-1 right-1 text-center text-[7px] font-black uppercase tracking-wider text-white bg-rose-950/75 rounded px-1 py-0.5 truncate">
        {category}
      </span>
    </button>
  );
}

export default function OrderedProductsTable({ items = [], onImagePreview, compact = false }) {
  const lineItems = items.length ? items : [];

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-12 text-rose-900/40 text-xs font-black uppercase tracking-widest border-2 border-dashed border-pink-100 rounded-2xl">
        No products in this order
      </div>
    );
  }

  if (compact) {
    return (
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-pink-100 text-[10px] font-black uppercase tracking-[0.15em] text-rose-950/40">
              <th className="py-3 px-3 w-24">Image</th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3 text-right">Price</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50/80">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-pink-50/30">
                <td className="py-4 px-3">
                  <ProductThumbnail item={item} size="sm" onPreview={onImagePreview} />
                </td>
                <td className="py-4 px-3">
                  <p className="font-extrabold text-sm text-rose-950 leading-snug">{item.productName}</p>
                  <p className="text-[11px] text-rose-900/55 font-medium line-clamp-2 mt-1 max-w-xs">
                    {item.productDescription || '—'}
                  </p>
                </td>
                <td className="py-4 px-3 text-xs font-bold text-rose-900/70">
                  {item.category || item.productCategory || 'General'}
                </td>
                <td className="py-4 px-3 font-mono text-xs font-bold text-rose-950/60">{item.sku || 'N/A'}</td>
                <td className="py-4 px-3 text-right font-bold text-rose-950">{formatPrice(item.price)}</td>
                <td className="py-4 px-3 text-center font-black text-rose-950">{item.quantity}</td>
                <td className="py-4 px-3 text-right font-extrabold text-rose-900">
                  {formatPrice(item.subtotal ?? item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {lineItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col lg:flex-row gap-5 p-5 sm:p-6 bg-[#fffafb] border border-pink-100/60 rounded-2xl hover:border-pink-200 hover:shadow-md transition-all"
        >
          <ProductThumbnail item={item} size="lg" onPreview={onImagePreview} />
          <div className="flex-grow min-w-0 space-y-3">
            <div>
              <h4 className="font-serif font-black text-lg sm:text-xl text-rose-950">{item.productName}</h4>
              <p className="text-sm text-rose-900/60 font-medium leading-relaxed mt-2">
                {item.productDescription || 'No description recorded at checkout.'}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-3 border-t border-pink-50">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-950/40 block">Category</span>
                <span className="text-xs font-bold text-rose-950">{item.category || item.productCategory || 'General'}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-950/40 block">SKU / Code</span>
                <span className="text-xs font-mono font-bold text-rose-900">{item.sku || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-950/40 block">Unit price</span>
                <span className="text-sm font-black text-rose-950">{formatPrice(item.price)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-950/40 block">Quantity</span>
                <span className="text-sm font-black text-rose-950">{item.quantity}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-950/40 block">Subtotal</span>
                <span className="text-sm font-extrabold text-rose-900">
                  {formatPrice(item.subtotal ?? item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
