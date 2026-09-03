'use client';

import React from 'react';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

function ProductThumbnail({ item, size = 'md', onPreview }) {
  const sizeClass =
    size === 'lg'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : size === 'sm'
        ? 'w-12 h-12'
        : 'w-16 h-16 sm:w-20 sm:h-20';

  const imageUrl = item.productImage;

  return (
    <button
      type="button"
      onClick={() => imageUrl && onPreview?.(imageUrl, item.productName)}
      disabled={!imageUrl}
      className={`${sizeClass} border border-brand-border bg-brand-surface overflow-hidden shrink-0 relative group ${
        imageUrl ? 'cursor-zoom-in hover:border-brand-accent' : 'cursor-default'
      } transition-colors`}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-brand-surface opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-brand-bg text-brand-muted/40 gap-0.5">
          <ImageIcon className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider">No photo</span>
        </div>
      )}
    </button>
  );
}

export default function OrderedProductsTable({ items = [], onImagePreview, compact = false }) {
  const lineItems = items.length ? items : [];

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-10 text-brand-muted text-xs uppercase tracking-widest border border-dashed border-brand-border">
        No products recorded for this order
      </div>
    );
  }

  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-brand-border text-[10px] font-medium uppercase tracking-wider text-brand-muted">
              <th className="py-2.5 px-3 w-16">Item</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 text-xs">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3 px-3">
                  <ProductThumbnail item={item} size="sm" onPreview={onImagePreview} />
                </td>
                <td className="py-3 px-3">
                  <p className="font-medium text-brand-dark">{item.productName}</p>
                  {item.sku && (
                    <p className="text-[10px] text-brand-muted font-mono">{item.sku}</p>
                  )}
                </td>
                <td className="py-3 px-3 text-brand-muted">
                  {item.category || item.productCategory || 'General'}
                </td>
                <td className="py-3 px-3 text-right font-mono text-brand-dark">
                  {formatPrice(item.price)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-brand-dark">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right font-mono font-medium text-brand-dark">
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
    <div className="space-y-3">
      {lineItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-brand-surface border border-brand-border"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <ProductThumbnail item={item} size="md" onPreview={onImagePreview} />
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-xs sm:text-sm font-medium text-brand-dark truncate">
                {item.productName}
              </h4>
              <p className="text-[11px] text-brand-muted">
                {item.category || item.productCategory || 'General'}
                {item.sku && <span className="ml-2 font-mono text-[10px]">SKU: {item.sku}</span>}
              </p>
              <p className="text-[11px] text-brand-muted font-mono">
                {formatPrice(item.price)} &times; {item.quantity}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 self-end sm:self-center">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted block">
              Item Total
            </span>
            <span className="font-mono text-sm font-medium text-brand-dark">
              {formatPrice(item.subtotal ?? item.price * item.quantity)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
