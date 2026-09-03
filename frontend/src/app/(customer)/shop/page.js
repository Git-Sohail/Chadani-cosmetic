'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../../components/ProductCard';
import { Search, Filter, X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import Button from '../../../components/Button';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../../utils/currency';

export function ShopContent() {
  const { API_URL } = useAuth();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(100);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(100);
  const [sortBy, setSortBy] = useState('latest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Fetch Data from Server
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);

      if (prodRes.data.length > 0) {
        const highestPrice = Math.max(...prodRes.data.map((p) => p.price));
        const ceiling = Math.ceil(highestPrice);
        setAbsoluteMaxPrice(ceiling);
        setMaxPrice(ceiling);
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync with URL query parameter changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    const searchFromUrl = searchParams.get('search') ?? searchParams.get('q');
    if (searchFromUrl !== null && searchFromUrl !== undefined) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMaxPrice(absoluteMaxPrice || 100);
    setSortBy('latest');
    setShowFiltersMobile(false);
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    maxPrice < absoluteMaxPrice;

  // Filtered and Sorted Products computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category?.name?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === 'lowToHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'highToLow') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, searchTerm, selectedCategory, maxPrice, sortBy]);

  const activeCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const found = categories.find((c) => c.id === selectedCategory);
    return found ? found.name : 'Category';
  }, [selectedCategory, categories]);

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Editorial Catalogue Header */}
        <header className="border-b border-brand-border/70 pb-8 mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block">
                Catalogue & Discovery
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-dark font-normal tracking-tight">
                The Collection
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted max-w-xl font-normal leading-relaxed">
                Discover verified skincare formulations, daily cosmetics, and artisan traditional jewelry available for local delivery across Dharan.
              </p>
            </div>

            {/* Quick Delivery Tag */}
            <div className="inline-flex items-center gap-2 text-xs text-brand-muted bg-brand-surface border border-brand-border px-3.5 py-1.5 self-start md:self-end">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span>Dharan Delivery &bull; Flat Rs. 100 &bull; Cash on Delivery</span>
            </div>
          </div>
        </header>

        {/* Toolbar: Search, Active Chips & Sort */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by product name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-brand-muted hover:text-brand-dark cursor-pointer p-0.5"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Controls Right: Mobile Filter Trigger & Sort Select */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Drawer Button */}
              <button
                type="button"
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs font-medium text-brand-dark hover:border-brand-accent transition-colors cursor-pointer min-h-[44px]"
                aria-label="Open filter drawer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" />
                <span>Filters {hasActiveFilters && '&bull; Active'}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-[11px] font-medium text-brand-muted uppercase tracking-wider shrink-0">
                  Sort
                </label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-brand-surface border border-brand-border rounded px-3 py-2 text-xs font-medium text-brand-dark focus:outline-none focus:border-brand-accent cursor-pointer min-h-[44px]"
                >
                  <option value="latest">New Arrivals</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/40 text-xs">
              <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">
                Active:
              </span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface border border-brand-border text-brand-dark rounded">
                  <span>Query: &ldquo;{searchTerm}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-brand-muted hover:text-brand-dark cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeCategoryName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface border border-brand-border text-brand-dark rounded">
                  <span>Category: {activeCategoryName}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-brand-muted hover:text-brand-dark cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {maxPrice < absoluteMaxPrice && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface border border-brand-border text-brand-dark rounded">
                  <span>Up to {formatPrice(maxPrice)}</span>
                  <button
                    type="button"
                    onClick={() => setMaxPrice(absoluteMaxPrice)}
                    className="text-brand-muted hover:text-brand-dark cursor-pointer"
                    aria-label="Reset price ceiling"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-brand-accent hover:underline uppercase tracking-wider font-medium ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Desktop Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-brand-surface border border-brand-border p-6 rounded space-y-7 sticky top-[calc(var(--nav-height-desktop)+1.5rem)]">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <span className="font-serif text-lg text-brand-dark font-medium flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-accent" />
                Refine
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] uppercase tracking-wider text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-brand-muted uppercase tracking-[0.2em]">
                Category
              </h4>
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-brand-dark text-brand-surface'
                      : 'text-brand-text hover:bg-brand-bg'
                  }`}
                >
                  <span>All Products</span>
                  {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-brand-dark text-brand-surface'
                        : 'text-brand-text hover:bg-brand-bg'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-2 border-t border-brand-border/60">
              <div className="flex justify-between items-center text-xs">
                <h4 className="text-[11px] font-medium text-brand-muted uppercase tracking-[0.2em]">
                  Max Price
                </h4>
                <span className="font-medium text-brand-dark">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="100"
                max={absoluteMaxPrice || 2000}
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-dark"
                aria-label="Filter products by maximum price"
              />
              <div className="flex justify-between text-[10px] text-brand-muted font-mono">
                <span>{formatPrice(100)}</span>
                <span>{formatPrice(absoluteMaxPrice || 2000)}</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-brand-surface border border-brand-border p-4 space-y-4 animate-pulse"
                  >
                    <div className="aspect-[4/5] bg-brand-border/40" />
                    <div className="h-3 bg-brand-border/40 w-1/3" />
                    <div className="h-4 bg-brand-border/40 w-3/4" />
                    <div className="h-4 bg-brand-border/40 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-brand-surface border border-brand-border p-8 max-w-lg mx-auto">
                <h3 className="font-serif text-xl text-brand-dark mb-2">Something went wrong</h3>
                <p className="text-xs text-brand-muted mb-6 leading-relaxed">{error}</p>
                <Button onClick={fetchData} variant="primary" size="md">
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-brand-surface border border-brand-border p-8">
                <div className="w-12 h-12 border border-brand-border flex items-center justify-center mb-4 bg-brand-bg text-brand-muted">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl text-brand-dark mb-2">No products found</h3>
                <p className="text-xs sm:text-sm text-brand-muted max-w-sm leading-relaxed mb-6">
                  We couldn&apos;t find any products matching your current filters. Adjust your criteria or view all items.
                </p>
                <Button onClick={handleResetFilters} variant="primary" size="md">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-brand-muted border-b border-brand-border/40 pb-3">
                  <p>
                    Showing <span className="font-semibold text-brand-dark">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowFiltersMobile(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-xs bg-brand-surface h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <h3 className="font-serif text-xl text-brand-dark font-medium">Filter Catalog</h3>
                <button
                  type="button"
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-2 text-brand-muted hover:text-brand-dark min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close filter drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-medium text-brand-muted uppercase tracking-[0.2em]">
                  Category
                </h4>
                <div className="flex flex-col space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`text-left px-3 py-3 text-xs font-medium rounded transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-brand-dark text-brand-surface'
                        : 'text-brand-text hover:bg-brand-bg'
                    }`}
                  >
                    <span>All Products</span>
                    {selectedCategory === 'all' && <Check className="w-4 h-4" />}
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-left px-3 py-3 text-xs font-medium rounded transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-brand-dark text-brand-surface'
                          : 'text-brand-text hover:bg-brand-bg'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-3 pt-4 border-t border-brand-border">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="text-[11px] font-medium text-brand-muted uppercase tracking-[0.2em]">
                    Max Price
                  </h4>
                  <span className="font-medium text-brand-dark">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max={absoluteMaxPrice || 2000}
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-dark"
                  aria-label="Filter products by price on mobile"
                />
                <div className="flex justify-between text-[10px] text-brand-muted font-mono">
                  <span>{formatPrice(100)}</span>
                  <span>{formatPrice(absoluteMaxPrice || 2000)}</span>
                </div>
              </div>
            </div>

            {/* Actions Bottom */}
            <div className="pt-6 border-t border-brand-border flex gap-3">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleResetFilters}
                className="min-h-[44px]"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setShowFiltersMobile(false)}
                className="min-h-[44px]"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center gap-3 text-brand-muted">
          <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-[0.2em] uppercase">Loading Collection...</span>
        </div>
      }
    >
      <ShopContent />
    </React.Suspense>
  );
}
