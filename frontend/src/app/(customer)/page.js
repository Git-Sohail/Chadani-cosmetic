'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HeroSection from '../../components/HeroSection';
import CategoryCard from '../../components/CategoryCard';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import { Sparkles, Star, Quote, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/currency';

export default function Home() {
  const { API_URL } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorize products for sections
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter(p => p.rating >= 4.8).slice(0, 4);
  const saleProducts = products.filter(p => p.isSale).slice(0, 4);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/products`)
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mock Reviews as they aren't in the DB yet
  const mockReviews = [
    { id: 1, name: 'Ayesha Khan', comment: 'The traditional bangles are stunning! They perfectly matched my wedding dress. High quality and elegant packaging.', rating: 5, date: '2 weeks ago' },
    { id: 2, name: 'Sana Ahmed', comment: 'Loved the vitamin C serum. It actually shows results in a week. Definitely coming back for more skincare.', rating: 5, date: '1 month ago' },
    { id: 3, name: 'Maria Gomez', comment: 'Exquisite jewellery pieces. The pearl choker is delicate and looks very expensive. Highly recommend Chadani Cosmetic.', rating: 4, date: '3 days ago' },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection 
        title="Treat Your Skin With The Best Treatment"
        subtitle="Chadani Cosmetic Organic Beauty"
        description="Indulge in dermatologically tested skincare products and pair them with exquisite handcrafted bangles designed for your grace."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-rose-900/60 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Loading Collection...</p>
        </div>
      ) : (
        <>
          {/* Featured Collections / Categories */}
          <section id="collections" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Explore Collections</span>
              <h2 className="text-4xl font-serif font-black text-rose-950 flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-rose-600" />
                Handpicked For You
              </h2>
              <p className="text-sm text-rose-900/60 font-medium leading-relaxed">
                Discover our curated selections ranging from organic skincare treats to heritage traditional bangles.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="py-24 bg-white border-y border-pink-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-6">
                <div className="text-center sm:text-left space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Latest Drops</span>
                  <h2 className="text-4xl font-serif font-black text-rose-950">
                    New Arrivals
                  </h2>
                </div>
                <Link href="/shop">
                  <Button variant="outline" size="md" className="group rounded-2xl border-pink-200 hover:border-rose-900 px-8">
                    Browse All
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>

          {/* Special Offer/Sale Section */}
          <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-rose-950 to-pink-950 text-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-2xl relative overflow-hidden group">
              {/* Abstract decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl group-hover:bg-rose-400/20 transition-all duration-700" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl group-hover:bg-pink-400/20 transition-all duration-700" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                    <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-rose-200 text-[10px] font-black px-5 py-2 rounded-full tracking-widest uppercase shadow-lg">
                      Exclusive Seasonal Offer
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-serif font-black leading-tight">
                      Glow Up With <br /> <span className="text-rose-300">30% Discount</span>
                    </h2>
                    <p className="text-pink-100/70 text-sm sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 font-medium">
                      Pamper your skin with our premium organic kits. Valid for a limited time only on our skincare collection.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href="/shop?category=skincare">
                      <Button variant="secondary" size="lg" className="bg-rose-300 hover:bg-white text-rose-950 border-rose-300 px-10 py-5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                        Shop Skincare Sale
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {saleProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest block opacity-70">
                          {product.category?.name}
                        </span>
                        <h4 className="font-serif font-black text-xl text-white leading-tight group-hover:text-rose-100 transition-colors">
                          {product.name}
                        </h4>
                      </div>
                      <div className="mt-8 flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.oldPrice && (
                            <span className="text-xs text-pink-300/40 line-through font-bold">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                          <span className="text-2xl font-black text-white">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <Link href={`/shop/${product.id}`}>
                          <Button variant="secondary" size="sm" className="bg-white hover:bg-pink-100 text-rose-950 rounded-xl px-5">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Best Sellers Section */}
          <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-3 mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Loved By All</span>
              <h2 className="text-4xl font-serif font-black text-rose-950">
                The Best Sellers
              </h2>
              <p className="text-sm text-rose-900/60 font-medium max-w-lg">
                These favorites are constantly flying off our shelves. Grab yours before they are gone!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/shop">
                <Button variant="primary" size="lg" className="px-12 py-4.5 rounded-2xl shadow-xl shadow-rose-900/10">
                  Explore Full Catalog
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Customer Reviews Section */}
      <section id="reviews" className="py-24 bg-pink-50/50 border-t border-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Testimonials</span>
            <h2 className="text-4xl font-serif font-black text-rose-950">
              Beauties Talk About Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {mockReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-pink-100 rounded-[2rem] p-10 shadow-sm relative group hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <Quote className="w-12 h-12 text-pink-100 group-hover:text-rose-100 absolute top-8 right-8 transition-colors" />
                <div className="flex items-center gap-1.5 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-100'}`}
                    />
                  ))}
                </div>
                <p className="text-rose-950 text-sm leading-relaxed mb-8 italic font-medium relative z-10">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center font-black text-rose-950 text-sm border-2 border-white shadow-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-rose-950 text-sm tracking-tight">{review.name}</h4>
                    <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
