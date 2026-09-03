'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchFilterBar({
  search,
  onSearch,
  placeholder = 'Search catalog…',
  filters = [], // [{ label, value, options: [{label, value}] }]
  onFilter,
  filterValues = {},
  sortOptions = [], // [{label, value}]
  sortValue,
  onSort,
}) {
  return (
    <div className="flex flex-wrap gap-2.5 items-center" role="search">
      {/* Search input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent placeholder:text-brand-muted/50 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic filter dropdowns */}
      {filters.map((f) => (
        <select
          key={f.value}
          value={filterValues[f.value] ?? ''}
          onChange={(e) => onFilter(f.value, e.target.value)}
          aria-label={f.label}
          className="px-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent cursor-pointer transition-colors"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      {/* Sort dropdown */}
      {sortOptions.length > 0 && (
        <select
          value={sortValue ?? ''}
          onChange={(e) => onSort(e.target.value)}
          aria-label="Sort by"
          className="px-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent cursor-pointer transition-colors"
        >
          <option value="">Sort by</option>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
