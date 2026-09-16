'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { reviewService, DbReview } from '@/lib/supabase/services';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: DbReview) => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orders, setOrders] = useState<{ id: string; orderNumber: string }[]>([]);
  const [existingReview, setExistingReview] = useState<DbReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const [userOrders, existing] = await Promise.all([
          reviewService.getUserOrdersForProduct(user!.id, productId),
          reviewService.getUserReviewForProduct(user!.id, productId),
        ]);
        setOrders(userOrders);
        if (existing) {
          setExistingReview(existing);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, productId]);

  if (!user) {
    return (
      <div className="border border-border p-6 text-center">
        <Icon name="StarIcon" variant="outline" size={24} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-foreground font-medium mb-1">Share your experience</p>
        <p className="text-xs text-muted-foreground mb-4">Sign in to leave a review for this product.</p>
        <Link href="/sign-up-login" className="btn-primary text-sm px-6 py-2 inline-block">
          Sign In to Review
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-border p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600" />
          <p className="text-sm font-semibold text-foreground">You reviewed this product</p>
        </div>
        <div className="flex star-rating mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="StarIcon" variant={i < existingReview.rating ? 'solid' : 'outline'} size={14} className={i < existingReview.rating ? 'text-accent' : 'text-muted-foreground'} />
          ))}
        </div>
        {existingReview.reviewText && (
          <p className="text-sm text-foreground/80 font-light leading-relaxed">{existingReview.reviewText}</p>
        )}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border border-border p-6 text-center">
        <Icon name="ShoppingBagIcon" size={24} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-foreground font-medium mb-1">Purchase required</p>
        <p className="text-xs text-muted-foreground">Only customers who have ordered this product can leave a review.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const submitted = await reviewService.submit({
        productId,
        userId: user.id,
        orderId: selectedOrderId || undefined,
        rating,
        reviewText: reviewText.trim(),
        reviewerName: profile?.fullName || user.email?.split('@')[0] || 'Customer',
      });
      if (submitted) {
        setSuccess(true);
        setExistingReview(submitted);
        onReviewSubmitted(submitted);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      if (err?.message?.includes('unique') || err?.code === '23505') {
        setError('You have already reviewed this product.');
      } else {
        setError(err?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-border p-6 text-center">
        <Icon name="CheckCircleIcon" size={24} className="mx-auto mb-3 text-green-600" />
        <p className="text-sm font-semibold text-foreground mb-1">Thank you for your review!</p>
        <p className="text-xs text-muted-foreground">Your feedback helps other shoppers.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border p-6">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground mb-5">Write a Review</h3>

      {/* Star Rating */}
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-2">Your Rating <span className="text-red-500">*</span></p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const starVal = i + 1;
            const filled = starVal <= (hoverRating || rating);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
              >
                <Icon
                  name="StarIcon"
                  variant={filled ? 'solid' : 'outline'}
                  size={24}
                  className={filled ? 'text-accent' : 'text-muted-foreground'}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-xs text-muted-foreground self-center">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Order selector (if multiple orders) */}
      {orders.length > 1 && (
        <div className="mb-5">
          <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-2" htmlFor="order-select">
            Linked Order
          </label>
          <select
            id="order-select"
            value={selectedOrderId}
            onChange={e => setSelectedOrderId(e.target.value)}
            className="w-full border border-border bg-background text-sm px-3 py-2 focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="">Select an order (optional)</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>Order #{o.orderNumber}</option>
            ))}
          </select>
        </div>
      )}

      {/* Review Text */}
      <div className="mb-5">
        <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-2" htmlFor="review-text">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-text"
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          rows={4}
          placeholder="Share your thoughts about the fit, quality, and style…"
          className="w-full border border-border bg-background text-sm px-3 py-2 focus:outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted-foreground"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{reviewText.length}/1000</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-4">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
