'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Star, Pencil, Trash2, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Avatar from './Avatar';

// ── Helpers ────────────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

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
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer p-0.5'}`}
          aria-label={`${star} star rating`}
        >
          <Star
            className={`${dim} transition-colors ${
              star <= (hovered || value)
                ? 'fill-brand-accent text-brand-accent'
                : 'text-brand-border fill-transparent'
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
      <span className="w-8 text-right font-medium text-brand-muted shrink-0">{label}&#9733;</span>
      <div className="flex-1 h-1.5 bg-brand-bg border border-brand-border/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-brand-muted text-right font-mono shrink-0">{count}</span>
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
  const [eligibility, setEligibility] = useState(null);
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

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${API_URL}/reviews/product/${productId}`);
      setReviews(res.data.reviews || []);
      setSummary(res.data.summary || { average: 0, total: 0, starCounts: {} });
    } catch {
      // silently fail — reviews section is non-critical
    } finally {
      setLoadingReviews(false);
    }
  }, [API_URL, productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Check review eligibility for customer
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
      setFormSuccess('Thank you. Your review has been recorded.');
      setFormRating(5);
      setFormComment('');
      setEligibility({ canReview: false, reason: 'already_reviewed' });
      await fetchReviews();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Unable to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      alert(err.response?.data?.error || 'Unable to update review.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    setDeletingId(reviewId);
    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`, { headers: authHeader });
      if (eligibility?.reason === 'already_reviewed') {
        setEligibility({ canReview: true });
      }
      await fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="border-t border-brand-border/60 pt-16 sm:pt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-1">
            Authentic Feedback
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark font-normal tracking-tight">
            Customer Reviews
          </h2>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border p-6 sm:p-10 space-y-10">
        {/* Rating Summary & Distribution */}
        {!loadingReviews && summary.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-brand-border/60">
            {/* Big Rating */}
            <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start space-y-1">
              <span className="font-serif text-5xl sm:text-6xl text-brand-dark leading-none">
                {Number(summary.average).toFixed(1)}
              </span>
              <div className="pt-2">
                <StarRating value={Math.round(summary.average)} readonly size="sm" />
              </div>
              <p className="text-xs text-brand-muted pt-1">
                Based on {summary.total} verified {summary.total === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="md:col-span-8 space-y-2 max-w-md w-full">
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

        {/* Write a Review Section */}
        {user?.role === 'customer' && (
          <div className="space-y-4">
            {loadingEligibility ? (
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-accent" />
                <span>Checking purchase verification...</span>
              </div>
            ) : eligibility?.canReview ? (
              <div className="bg-brand-bg border border-brand-border p-6 rounded space-y-5">
                <div>
                  <h3 className="font-serif text-xl text-brand-dark">Share Your Experience</h3>
                  <p className="text-xs text-brand-muted mt-1">
                    Your feedback assists other patrons in selecting verified beauty essentials.
                  </p>
                </div>

                {formSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-brand-muted uppercase tracking-wider block">
                      Overall Rating
                    </label>
                    <StarRating value={formRating} onChange={setFormRating} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-brand-muted uppercase tracking-wider block">
                      Review Remarks <span className="normal-case text-brand-muted/70">(Optional)</span>
                    </label>
                    <textarea
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Detail your experience with fragrance, texture, packaging, or performance..."
                      rows={3}
                      maxLength={1000}
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent resize-none"
                    />
                    <div className="text-[10px] text-brand-muted/70 text-right font-mono">
                      {formComment.length}/1000
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="primary"
                    size="sm"
                    className="tracking-[0.16em] uppercase text-[11px] min-h-[44px]"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    ) : (
                      <Star className="w-3.5 h-3.5 mr-2" />
                    )}
                    Submit Review
                  </Button>
                </form>
              </div>
            ) : eligibility?.reason === 'already_reviewed' ? (
              <div className="flex items-center gap-2 text-xs text-brand-muted bg-brand-bg border border-brand-border p-4">
                <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
                <span>You have reviewed this product. You can update or delete your comment below.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-xs text-brand-muted bg-brand-bg border border-brand-border p-4">
                <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <span>
                  Reviews are reserved for customers with confirmed delivered orders of this item.
                </span>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="text-xs text-brand-muted bg-brand-bg border border-brand-border p-4 flex items-center justify-between gap-4 flex-wrap">
            <span>Have you purchased this item? Sign in to submit a verified product review.</span>
            <a
              href="/login"
              className="text-brand-dark font-medium underline uppercase tracking-wider text-[11px] hover:text-brand-accent"
            >
              Sign In &rarr;
            </a>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6 pt-2">
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-xs text-brand-muted py-8 font-serif italic">
              No reviews recorded for this product yet.
            </p>
          ) : (
            reviews.map((review) => {
              const isOwn = user?.id === review.user?.id;
              const isAdmin = user?.role === 'admin';
              const isEditing = editingId === review.id;

              return (
                <div
                  key={review.id}
                  className="flex gap-4 pb-6 border-b border-brand-border/50 last:border-0 last:pb-0"
                >
                  {/* User Avatar */}
                  <Avatar
                    src={review.user?.profileImage}
                    name={review.user?.name}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {isEditing ? (
                      /* Edit Mode */
                      <form onSubmit={handleEditSubmit} className="space-y-3 bg-brand-bg p-4 border border-brand-border">
                        <StarRating value={editRating} onChange={setEditRating} />
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={2}
                          maxLength={1000}
                          className="w-full px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded focus:outline-none focus:border-brand-accent resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={editSubmitting}
                            variant="primary"
                            size="sm"
                            className="min-h-[38px] text-[10px] uppercase tracking-wider"
                          >
                            {editSubmitting ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelEdit}
                            variant="secondary"
                            size="sm"
                            className="min-h-[38px] text-[10px] uppercase tracking-wider"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* Read Mode */
                      <>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-brand-dark">
                              {review.user?.name || 'Verified Customer'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Order</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-brand-muted font-mono">
                            {formatDate(review.updatedAt || review.createdAt)}
                          </span>
                        </div>

                        <div className="pt-0.5">
                          <StarRating value={review.rating} readonly size="sm" />
                        </div>

                        {review.comment && (
                          <p className="text-xs text-brand-muted leading-relaxed pt-1">
                            {review.comment}
                          </p>
                        )}

                        {/* Customer & Admin Controls */}
                        {(isOwn || isAdmin) && (
                          <div className="flex items-center gap-3 pt-2">
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => startEdit(review)}
                                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-accent hover:underline cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(review.id)}
                              disabled={deletingId === review.id}
                              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{deletingId === review.id ? 'Deleting...' : 'Delete'}</span>
                            </button>
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
