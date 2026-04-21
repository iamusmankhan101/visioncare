// Dynamic reviews data for products
export const reviewsData = {
  // All products start with no reviews
};

// Function to get reviews for a specific product
export const getProductReviews = (productId) => {
  return reviewsData[productId] || [];
};

// Function to calculate average rating for a product
export const getAverageRating = (productId) => {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

// Function to get total review count for a product
export const getReviewCount = (productId) => {
  const reviews = getProductReviews(productId);
  return reviews.length;
};
