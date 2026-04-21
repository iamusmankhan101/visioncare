const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get all reviews for a specific product
export const getProductReviews = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get review statistics for a product
export const getReviewStats = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${productId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch review stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { count: 0, averageRating: 0 };
  }
};
