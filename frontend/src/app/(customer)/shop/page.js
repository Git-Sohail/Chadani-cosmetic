'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../../components/ProductCard';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Button from '../../../components/Button';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice, currencyConfig } from '../../../utils/currency';

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
  const [sortBy, setSortBy] = useState('latest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Fetch Data from Server
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      
      // Dynamically set max price based on product data
      if (prodRes.data.length > 0) {
        const highestPrice = Math.max(...prodRes.data.map(p => p.price));
        setMaxPrice(Math.ceil(highestPrice));
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError('Failed to load products. Please try again later.');
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
  }, [searchParams]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.price));
      setMaxPrice(Math.ceil(highestPrice));
    } else {
      setMaxPrice(100);
    }
    setSortBy('latest');
  };

  // Filtered and Sorted Products computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
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
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, searchTerm, selectedCategory, maxPrice, sortBy]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-[2.5rem] p-8 sm:p-12 mb-10 text-center sm:text-left relative overflow-hidden border border-pink-200/40">
          <div className="max-w-xl relative z-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-800 bg-white/50 px-3 py-1 rounded-full">
              Chadani Cosmetic Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-rose-950">
              Explore Our Collection
            </h1>
            <p className="text-sm sm:text-base text-rose-900/80 leading-relaxed max-w-lg">
              Find the perfect skincare treats, vibrant lipsticks, elegant Gold-plated bangle sets, and handpicked premium jewelry.
            </p>
          </div>
          <div className="absolute right-10 bottom-0 opacity-10 text-rose-900 font-serif text-8xl font-bold select-none hidden lg:block">
            BEAUTY
          </div>
        </div>

        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
          <div className="relative w-full md:max-w-md group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-900/45 group-focus-within:text-rose-600 transition-colors">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search cosmetics, bangles, jewellery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-pink-100 rounded-2xl text-sm text-rose-950 placeholder-rose-900/40 focus:outline-none focus:ring-4 focus:ring-rose-900/5 focus:border-rose-300 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <Button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              variant="outline"
              size="md"
              className="md:hidden flex items-center gap-2 rounded-2xl border-pink-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-rose-950/60 uppercase tracking-widest shrink-0">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-pink-200 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-950 focus:outline-none focus:ring-4 focus:ring-rose-900/5 cursor-pointer shadow-sm hover:border-rose-300 transition-all"
              >
                <option value="latest">New Arrivals</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Filters Sidebar (Desktop) */}
          <aside className={`lg:block ${showFiltersMobile ? 'block' : 'hidden'} space-y-8 bg-white border border-pink-100 p-8 rounded-[2rem] h-fit shadow-sm sticky top-28`}>
            
            <div className="flex items-center justify-between pb-5 border-b border-pink-50">
              <span className="font-serif font-black text-rose-950 flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5 text-rose-600" />
                Filter
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[10px] uppercase tracking-widest font-black text-rose-700 hover:text-rose-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-rose-950/40 uppercase tracking-widest">Category</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-rose-900 text-white shadow-md translate-x-1'
                      : 'text-rose-950/70 hover:bg-pink-50 hover:text-rose-900'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-rose-900 text-white shadow-md translate-x-1'
                        : 'text-rose-950/70 hover:bg-pink-50 hover:text-rose-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-rose-950/40 uppercase tracking-widest">Max Price</h4>
                <span className="text-sm font-black text-rose-900">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="5"
                max={products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 200}
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-rose-900"
              />
              <div className="flex justify-between text-[10px] font-black text-rose-900/40 uppercase tracking-tighter">
                <span>{formatPrice(5)}</span>
                <span>{formatPrice(products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 200)}</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 animate-pulse">
                    <div className="aspect-square bg-pink-50 rounded-2xl" />
                    <div className="h-4 bg-pink-50 rounded w-2/3" />
                    <div className="h-4 bg-pink-50 rounded w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-pink-50 rounded w-1/4" />
                      <div className="h-10 bg-pink-50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100 p-8">
                <span className="text-4xl mb-4 block">⚠️</span>
                <h3 className="text-xl font-serif font-black text-red-950">{error}</h3>
                <Button onClick={fetchData} variant="primary" className="mt-6">Try Again</Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-[2.5rem] border border-pink-100 shadow-sm p-10">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-rose-200" />
                </div>
                <h3 className="font-serif font-black text-2xl text-rose-950">No products found</h3>
                <p className="text-sm text-rose-900/60 mt-3 max-w-sm font-medium leading-relaxed">
                  We couldn&apos;t find any items matching your current filters. Try resetting or adjusting them to see more.
                </p>
                <Button onClick={handleResetFilters} variant="primary" size="md" className="mt-8 px-10">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-8 border-b border-pink-100 pb-4">
                  <p className="text-sm font-bold text-rose-950/60">
                    Showing <span className="text-rose-950 font-black">{filteredProducts.length}</span> results
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default function Shop() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-pink-50/10 flex flex-col justify-center items-center gap-4 text-rose-950/40">
        <svg className="animate-spin h-8 w-8 text-rose-800" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-black uppercase tracking-[0.3em]">Loading luxury shop...</span>
      </div>
    }>
      <ShopContent />
    </React.Suspense>
  );
}
