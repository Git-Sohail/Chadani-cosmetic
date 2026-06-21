'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function StarRow({ rating, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${dim} transition-colors ${
            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-rose-200 fill-rose-100'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const name = review.user?.name || 'Customer';
  const avatar = review.user?.profileImage;
  const initial = name.charAt(0).toUpperCase();
  const productName = review.product?.name;
  const productImage = review.product?.image;

  return (
    <div className="relative bg-white/70 backdrop-blur-md border border-pink-100/80 rounded-[1.75rem] p-6 sm:p-7 shadow-lg shadow-rose-900/5 flex flex-col h-full group hover:shadow-xl hover:shadow-rose-900/8 transition-all duration-300">
      {/* Glassmorphism accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#B76E79]/10 to-transparent rounded-[1.75rem] pointer-events-none" />

      {/* Quote icon */}
      <Quote className="w-7 h-7 text-[#B76E79]/25 mb-4 shrink-0" />

      {/* Rating */}
      <StarRow rating={review.rating} />

      {/* Comment */}
      <p className="mt-3 text-sm text-rose-950/75 font-medium leading-relaxed flex-1 line-clamp-4 italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Product pill */}
      {productName && (
        <div className="mt-4 flex items-center gap-2">
          {productImage && (
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-pink-100 shrink-0">
              <img src={productImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-[10px] font-black uppercase tracking-wider text-[#7A003C]/60 truncate">
            {productName}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="my-4 h-px bg-gradient-to-r from-transparent via-pink-200/60 to-transparent" />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#B76E79]/20 overflow-hidden bg-gradient-to-br from-[#7A003C] to-[#B76E79] text-white flex items-center justify-center font-black text-sm shrink-0">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-rose-950 truncate">{name}</p>
          <p className="text-[10px] text-rose-900/40 font-medium">
            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-5">
        <MessageSquare className="w-9 h-9 text-rose-200" />
      </div>
      <h3 className="font-serif font-black text-xl text-rose-950 mb-2">No customer reviews yet</h3>
      <p className="text-sm text-rose-900/50 font-medium max-w-sm leading-relaxed">
        Be the first to review our products after your purchase.
      </p>
      <Link href="/shop"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#7A003C] text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-[#5a002c] transition-colors">
        Shop & Review
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
    axios.get(`${API_URL}/reviews/latest`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(reviews.length / perPage));
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const next = () => setPage((p) => (p === totalPages - 1 ? 0 : p + 1));

  return (
    <section id="reviews" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fff5f7] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#7A003C]/8 text-[#7A003C] text-[10px] font-black uppercase tracking-[0.25em] mb-4 border border-[#7A003C]/15">
            Customer Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-rose-950 font-black mt-2">
            What Our Customers Say
          </h2>
          <p className="text-sm text-rose-900/50 font-medium mt-3 leading-relaxed">
            Real reviews from verified purchases — no fake testimonials.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 border border-pink-100 rounded-[1.75rem] p-6 h-64 animate-pulse space-y-3">
                <div className="w-20 h-3 bg-pink-100 rounded" />
                <div className="w-full h-3 bg-pink-100 rounded" />
                <div className="w-3/4 h-3 bg-pink-100 rounded" />
                <div className="w-1/2 h-3 bg-pink-100 rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          <>
            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination — only if more than 3 reviews */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button type="button" onClick={prev} aria-label="Previous"
                  className="w-10 h-10 rounded-full border border-pink-100 bg-white flex items-center justify-center hover:bg-[#7A003C] hover:text-white hover:border-[#7A003C] transition-all text-rose-900/60">
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setPage(i)}
                      aria-label={`Page ${i + 1}`}
                      className={`rounded-full transition-all ${i === page ? 'w-6 h-2.5 bg-[#7A003C]' : 'w-2.5 h-2.5 bg-[#B76E79]/30 hover:bg-[#B76E79]/60'}`}
                    />
                  ))}
                </div>

                <button type="button" onClick={next} aria-label="Next"
                  className="w-10 h-10 rounded-full border border-pink-100 bg-white flex items-center justify-center hover:bg-[#7A003C] hover:text-white hover:border-[#7A003C] transition-all text-rose-900/60">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Total count */}
            <p className="text-center text-[10px] text-rose-900/30 font-semibold uppercase tracking-widest mt-6">
              {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
