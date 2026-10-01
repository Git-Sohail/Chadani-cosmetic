'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating
              ? 'fill-brand-accent text-brand-accent'
              : 'fill-transparent text-brand-border'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const name = review.user?.name || 'Verified Customer';
  const initial = name.charAt(0).toUpperCase();
  const productName = review.product?.name;
  const productImage = review.product?.image;

  return (
    <div className="bg-brand-surface border border-brand-border p-6 sm:p-7 flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        {/* Rating & Product Tag */}
        <div className="flex items-center justify-between gap-2">
          <StarRow rating={review.rating} />
          {productName && (
            <span className="text-[10px] uppercase tracking-[0.16em] text-brand-accent truncate max-w-[160px]">
              {productName}
            </span>
          )}
        </div>

        {/* Comment */}
        <p className="font-serif text-base sm:text-lg text-brand-dark leading-relaxed italic font-normal">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      {/* Author & Verification */}
      <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-brand-border bg-brand-bg text-brand-dark flex items-center justify-center font-medium text-xs">
            {initial}
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-dark uppercase tracking-wider">{name}</p>
            <p className="text-[10px] text-brand-muted">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {productImage && (
          <div className="w-8 h-8 border border-brand-border overflow-hidden shrink-0">
            <img src={productImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-brand-surface border border-brand-border">
      <div className="w-12 h-12 border border-brand-border flex items-center justify-center mb-4 bg-brand-bg text-brand-accent">
        <MessageSquare className="w-5 h-5" />
      </div>
      <h3 className="font-serif text-xl text-brand-dark mb-1">Customer Impressions</h3>
      <p className="text-xs sm:text-sm text-brand-muted max-w-sm leading-relaxed">
        Our customer reviews will appear here as verified shoppers share their experiences.
      </p>
      <Link
        href="/shop"
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-[0.16em] hover:bg-brand-accent transition-colors"
      >
        Explore Collection
      </Link>
    </div>
  );
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 3;

  useEffect(() => {
    axios
      .get(`${API_URL}/reviews/latest`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(reviews.length / perPage));
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const next = () => setPage((p) => (p === totalPages - 1 ? 0 : p + 1));

  return (
    <section id="reviews" className="py-16 sm:py-20 lg:py-24 bg-brand-bg border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 border-b border-brand-border/60 pb-5">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
              Community Voices
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight">
              Customer Experiences
            </h2>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-start sm:self-end">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous reviews"
                className="w-8 h-8 border border-brand-border bg-brand-surface flex items-center justify-center text-brand-dark hover:border-brand-accent hover:text-brand-accent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-brand-muted px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={next}
                aria-label="Next reviews"
                className="w-8 h-8 border border-brand-border bg-brand-surface flex items-center justify-center text-brand-dark hover:border-brand-accent hover:text-brand-accent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-brand-surface border border-brand-border p-6 h-56 animate-pulse space-y-4"
              >
                <div className="w-24 h-3 bg-brand-border/60" />
                <div className="w-full h-3 bg-brand-border/40" />
                <div className="w-4/5 h-3 bg-brand-border/40" />
                <div className="w-1/2 h-3 bg-brand-border/40 pt-4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visible.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
