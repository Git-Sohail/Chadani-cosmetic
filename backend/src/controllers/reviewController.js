const prisma = require('../db');

// Recalculate and persist the average rating for a product
async function syncProductRating(productId, tx = prisma) {
  const agg = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const avg = agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : 5.0;
  await tx.product.update({ where: { id: productId }, data: { rating: avg } });
  return { avg, count: agg._count.rating };
}

// GET /api/reviews/product/:productId
// Public — anyone can see reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Star breakdown (how many 1-star, 2-star… reviews)
    const breakdown = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    });

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach((b) => {
      starCounts[b.rating] = b._count.rating;
    });

    res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
      })),
      summary: {
        average: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : 0,
        total: agg._count.rating,
        starCounts,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Could not load reviews.' });
  }
};

// GET /api/reviews/product/:productId/can-review
// Auth required — checks if the logged-in customer can leave a review
const canReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Already reviewed?
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true, rating: true, comment: true, createdAt: true },
    });

    if (existing) {
      return res.json({ canReview: false, reason: 'already_reviewed', existing });
    }

    // Has a delivered order containing this product?
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: 'delivered',
        orderItems: { some: { productId } },
      },
      select: { id: true },
    });

    if (!deliveredOrder) {
      return res.json({
        canReview: false,
        reason: 'not_purchased',
      });
    }

    res.json({ canReview: true });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({ error: 'Could not check review eligibility.' });
  }
};

// POST /api/reviews/product/:productId
// Auth required — customer submits a review
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Must have a delivered order with this product
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: 'delivered',
        orderItems: { some: { productId } },
      },
      select: { id: true },
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        error: 'You can only review products from delivered orders.',
      });
    }

    // One review per customer per product (enforced by DB unique too)
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this product.' });
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          userId,
          productId,
          rating: parseInt(rating),
          comment: comment?.trim() || null,
        },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      });
      await syncProductRating(productId, tx);
      return created;
    });

    res.status(201).json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: review.user,
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Could not submit review.' });
  }
};

// PUT /api/reviews/:reviewId
// Auth required — customer edits their own review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) return res.status(404).json({ error: 'Review not found.' });
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews.' });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const review = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(rating !== undefined && { rating: parseInt(rating) }),
          ...(comment !== undefined && { comment: comment?.trim() || null }),
        },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      });
      await syncProductRating(existing.productId, tx);
      return updated;
    });

    res.json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
      },
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Could not update review.' });
  }
};

// DELETE /api/reviews/:reviewId
// Auth required — customer deletes own review OR admin deletes any
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const existing = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!existing) return res.status(404).json({ error: 'Review not found.' });

    if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorised to delete this review.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await syncProductRating(existing.productId, tx);
    });

    res.json({ message: 'Review deleted.' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Could not delete review.' });
  }
};

module.exports = {
  getProductReviews,
  canReview,
  createReview,
  updateReview,
  deleteReview,
};
