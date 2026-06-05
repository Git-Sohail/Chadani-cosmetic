import { Search, X } from 'lucide-react';

export default function SearchFilterBar({
  search,
  onSearch,
  placeholder = 'Search…',
  filters = [],   // [{ label, value, options: [{label, value}] }]
  onFilter,
  filterValues = {},
  sortOptions = [], // [{label, value}]
  sortValue,
  onSort,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center" role="search">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-900/30 pointer-events-none" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-200 placeholder-rose-900/30"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-900/30 hover:text-rose-900 transition-colors"
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
          className="px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-xs font-black text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}

      {/* Sort */}
      {sortOptions.length > 0 && (
        <select
          value={sortValue ?? ''}
          onChange={(e) => onSort(e.target.value)}
          aria-label="Sort by"
          className="px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-xs font-black text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer"
        >
          <option value="">Sort by</option>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
