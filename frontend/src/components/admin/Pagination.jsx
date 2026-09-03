import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-4">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="p-2 border border-brand-border bg-brand-surface text-brand-dark hover:border-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPage(1)}
            className="px-3 py-1.5 text-xs font-mono text-brand-dark hover:border-brand-accent border border-brand-border bg-brand-surface transition-colors"
          >
            1
          </button>
          {pages[0] > 2 && <span className="text-brand-muted text-xs px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1.5 text-xs font-mono transition-colors border ${
            p === page
              ? 'bg-brand-dark text-brand-surface border-brand-dark'
              : 'text-brand-dark border-brand-border bg-brand-surface hover:border-brand-accent'
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-brand-muted text-xs px-1">…</span>
          )}
          <button
            type="button"
            onClick={() => onPage(totalPages)}
            className="px-3 py-1.5 text-xs font-mono text-brand-dark hover:border-brand-accent border border-brand-border bg-brand-surface transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="p-2 border border-brand-border bg-brand-surface text-brand-dark hover:border-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
