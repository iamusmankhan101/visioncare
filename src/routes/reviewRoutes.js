const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, getReviewStats } = require('../api/reviewsApi');

// GET /api/reviews/:productId - Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await getProductReviews(productId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - Create a new review
router.post('/', async (req, res) => {
  try {
    const { productId, name, rating, text } = req.body;
    
    // Validate required fields
    if (!productId || !name || !rating || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const review = await createReview({
      productId,
      name: name.trim(),
      rating: parseInt(rating),
      text: text.trim(),
      verified: false
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/reviews/:productId/stats - Get review statistics for a product
router.get('/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params;
    const stats = await getReviewStats(productId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ error: 'Failed to fetch review stats' });
  }
});

module.exports = router;
