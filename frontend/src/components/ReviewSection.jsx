'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Star, Pencil, Trash2, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Helpers ────────────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${star} star`}
        >
          <Star
            className={`${dim} transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-rose-200 fill-rose-100'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-8 text-right font-bold text-rose-900/60 shrink-0">{label}★</span>
      <div className="flex-1 h-2 bg-pink-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-rose-900/50 font-semibold shrink-0">{count}</span>
    </div>
  );
}

function formatDate(str) {
  return new Date(str).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ReviewSection({ productId }) {
  const { user, token, API_URL } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, total: 0, starCounts: {} });
  const [loadingReviews, setLoadingReviews] = useState(true);

  // eligibility
  const [eligibility, setEligibility] = useState(null); // null | { canReview, reason, existing }
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  // form state
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // delete
  const [deletingId, setDeletingId] = useState(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // ── Fetch reviews ────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${API_URL}/reviews/product/${productId}`);
      setReviews(res.data.reviews);
      setSummary(res.data.summary);
    } catch {
      // silently fail — reviews section is non-critical
    } finally {
      setLoadingReviews(false);
    }
  }, [API_URL, productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Check eligibility when user logs in ──────────────────────────────────────
  useEffect(() => {
    if (!token || !user || user.role !== 'customer') {
      setEligibility(null);
      return;
    }
    setLoadingEligibility(true);
    axios
      .get(`${API_URL}/reviews/product/${productId}/can-review`, {
        headers: authHeader,
      })
      .then((res) => setEligibility(res.data))
      .catch(() => setEligibility(null))
      .finally(() => setLoadingEligibility(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, productId]);

  // ── Submit new review ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/reviews/product/${productId}`,
        { rating: formRating, comment: formComment.trim() || undefined },
        { headers: authHeader }
      );
      setFormSuccess('Your review has been posted!');
      setFormRating(5);
      setFormComment('');
      setEligibility({ canReview: false, reason: 'already_reviewed' });
      await fetchReviews();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit review ──────────────────────────────────────────────────────────────
  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/reviews/${editingId}`,
        { rating: editRating, comment: editComment.trim() || undefined },
        { headers: authHeader }
      );
      setEditingId(null);
      await fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update review.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete review ────────────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    setDeletingId(reviewId);
    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`, { headers: authHeader });
      if (eligibility?.reason === 'already_reviewed') {
        setEligibility({ canReview: true });
      }
      await fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section className="mt-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
          Customer Feedback
        </span>
        <h3 className="text-3xl font-serif font-black text-rose-950">Reviews</h3>
      </div>

      <div className="bg-white border border-pink-100 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-10">

        {/* Summary row */}
        {!loadingReviews && summary.total > 0 && (
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {/* Big average */}
            <div className="text-center shrink-0">
              <p className="text-6xl font-black text-rose-950">{summary.average}</p>
              <StarRating value={Math.round(summary.average)} readonly size="sm" />
              <p className="text-xs text-rose-900/50 font-semibold mt-1">
                {summary.total} {summary.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            {/* Bar breakdown */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((s) => (
                <RatingBar
                  key={s}
                  label={s}
                  count={summary.starCounts[s] ?? 0}
                  total={summary.total}
                />
              ))}
            </div>
          </div>
        )}

        {/* Write a review form */}
        {user?.role === 'customer' && (
          <div className="border-t border-pink-50 pt-8">
            {loadingEligibility ? (
              <div className="flex items-center gap-2 text-sm text-rose-900/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking eligibility…
              </div>
            ) : eligibility?.canReview ? (
              <div className="space-y-5">
                <h4 className="font-serif font-black text-xl text-rose-950">Write a Review</h4>

                {formSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {formSuccess}
                  </div>
                )}
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-4 py-3 rounded-2xl">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-widest">
                      Your rating
                    </label>
                    <StarRating value={formRating} onChange={setFormRating} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-widest">
                      Comment <span className="normal-case font-semibold">(optional)</span>
                    </label>
                    <textarea
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Share your experience with this product…"
                      rows={3}
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-pink-50/20 border border-pink-100 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <p className="text-[10px] text-rose-900/30 text-right">
                      {formComment.length}/1000
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-rose-900 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-950 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    Post Review
                  </button>
                </form>
              </div>
            ) : eligibility?.reason === 'already_reviewed' ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                You have already reviewed this product. Find your review below to edit it.
              </div>
            ) : (
              <div className="flex items-start gap-3 text-sm text-rose-900/60 font-semibold bg-pink-50/60 border border-pink-100 px-5 py-4 rounded-2xl">
                <Star className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>
                  Only customers who have received a delivered order for this product can leave a review.
                </span>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="border-t border-pink-50 pt-8 text-sm text-rose-900/50 font-semibold">
            <a href="/login" className="text-rose-800 underline underline-offset-2 hover:text-rose-950">
              Sign in
            </a>{' '}
            to leave a review.
          </div>
        )}

        {/* Reviews list */}
        <div className="border-t border-pink-50 pt-8 space-y-6">
          {loadingReviews ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-rose-300" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-sm text-rose-900/40 font-semibold py-8">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            reviews.map((review) => {
              const isOwn = user?.id === review.user?.id;
              const isAdmin = user?.role === 'admin';
              const isEditing = editingId === review.id;

              return (
                <div
                  key={review.id}
                  className="flex gap-4 pb-6 border-b border-pink-50 last:border-0 last:pb-0"
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                    {review.user?.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt={review.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.user?.name?.charAt(0) ?? '?'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      /* ── Edit form ── */
                      <form onSubmit={handleEditSubmit} className="space-y-3">
                        <StarRating value={editRating} onChange={setEditRating} />
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={2}
                          maxLength={1000}
                          className="w-full px-4 py-2.5 border border-pink-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="px-5 py-2 rounded-xl bg-rose-900 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 hover:bg-rose-950 transition-colors"
                          >
                            {editSubmitting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-5 py-2 rounded-xl border border-pink-100 text-xs font-black uppercase tracking-wider text-rose-900 hover:bg-pink-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* ── Read view ── */
                      <>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-rose-950">
                              {review.user?.name ?? 'Customer'}
                            </span>
                            <StarRating value={review.rating} readonly size="sm" />
                          </div>
                          <span className="text-[10px] text-rose-900/40 font-semibold">
                            {formatDate(review.updatedAt || review.createdAt)}
                          </span>
                        </div>

                        {review.comment && (
                          <p className="mt-1.5 text-sm text-rose-900/70 leading-relaxed">
                            {review.comment}
                          </p>
                        )}

                        {(isOwn || isAdmin) && (
                          <div className="flex gap-3 mt-2">
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => startEdit(review)}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-900 transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </button>
                            )}
                            {(isOwn || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleDelete(review.id)}
                                disabled={deletingId === review.id}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              >
                                {deletingId === review.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
