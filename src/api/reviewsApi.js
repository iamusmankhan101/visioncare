const Review = require('../models/Review');
const sequelize = require('../config/database');

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync the Review model to create the table
    await Review.sync({ alter: true });
    console.log('Review table created/updated successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Get all reviews for a specific product
const getProductReviews = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { productId },
      order: [['createdAt', 'DESC']]
    });
    
    return reviews.map(review => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      text: review.text,
      verified: review.verified,
      date: review.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Create a new review
const createReview = async (reviewData) => {
  try {
    const review = await Review.create({
      productId: reviewData.productId,
      name: reviewData.name,
      rating: reviewData.rating,
      text: reviewData.text,
      verified: reviewData.verified || false
    });
    
    return {
      id: review.id,
      name: review.name,
      rating: review.rating,
      text: review.text,
      verified: review.verified,
      date: review.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get review statistics for a product
const getReviewStats = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { productId },
      attributes: ['rating']
    });
    
    if (reviews.length === 0) {
      return { count: 0, averageRating: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    return {
      count: reviews.length,
      averageRating: parseFloat(averageRating)
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

// Delete a review (optional - for admin purposes)
const deleteReview = async (reviewId) => {
  try {
    const result = await Review.destroy({
      where: { id: reviewId }
    });
    return result > 0;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  getProductReviews,
  createReview,
  getReviewStats,
  deleteReview
};
