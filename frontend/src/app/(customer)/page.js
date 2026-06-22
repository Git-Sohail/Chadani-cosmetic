'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LuxuryHero from '../../components/home/LuxuryHero';
import FeatureBar from '../../components/home/FeatureBar';
import CategoryShowcase from '../../components/home/CategoryShowcase';
import BestSellersSection from '../../components/home/BestSellersSection';
import CollectionBanner from '../../components/home/CollectionBanner';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import ReviewsCarousel from '../../components/home/ReviewsCarousel';
import InstagramGallery from '../../components/home/InstagramGallery';
import NewsletterSection from '../../components/home/NewsletterSection';





export default function Home() {
  const { API_URL } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const bestSellers = products.filter((p) => p.rating >= 4.5).slice(0, 4);
  const displayBestSellers = bestSellers.length >= 4 ? bestSellers : products.slice(0, 4);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/products`),
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

  return (
    <div className="overflow-x-hidden bg-luxury-pink">
      <LuxuryHero />
      <FeatureBar />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-luxury-burgundy/50 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-burgundy" />
          <p className="text-xs font-medium uppercase tracking-[0.25em]">Loading Collection</p>
        </div>
      ) : (
        <>
          <CategoryShowcase categories={categories} />
          <BestSellersSection products={displayBestSellers} />
        </>
      )}

      <CollectionBanner />
      <WhyChooseUs />
      <ReviewsCarousel />
      <InstagramGallery />
      <NewsletterSection />
    </div>
  );
}
