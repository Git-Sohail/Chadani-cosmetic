import React from 'react';

export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-brand-border/50 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-brand-surface border border-brand-border p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-border/50 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="border-b border-brand-border/40">
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="py-3 px-4">
          <div className="animate-pulse bg-brand-border/40 rounded h-3.5 w-full" />
        </td>
      ))}
    </tr>
  ));
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-brand-surface border border-brand-border p-5 animate-pulse space-y-3">
          <SkeletonLine className="h-3 w-1/2" />
          <SkeletonLine className="h-6 w-2/3" />
          <SkeletonLine className="h-2.5 w-1/3" />
        </div>
      ))}
    </div>
  );
}
