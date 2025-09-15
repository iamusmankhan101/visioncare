const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, '..', 'src', 'eyewear.sqlite');
const db = new sqlite3.Database(dbPath);

// Create reviews table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    verified BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API Routes

// Submit a new review
app.post('/api/reviews', (req, res) => {
  const { productId, name, email, rating, title, text } = req.body;
  
  if (!productId || !name || !rating || !title || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO reviews (productId, name, email, rating, title, text, verified, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')
  `);
  
  stmt.run([productId, name, email || null, rating, title, text], function(err) {
    if (err) {
      console.error('Error inserting review:', err);
      return res.status(500).json({ error: 'Failed to save review' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Review submitted successfully' 
    });
  });
  
  stmt.finalize();
});

// Get all reviews (for admin)
app.get('/api/reviews/all', (req, res) => {
  db.all(`
    SELECT * FROM reviews 
    ORDER BY createdAt DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    
    res.json(rows);
  });
});

// Get reviews for a specific product (only approved)
app.get('/api/reviews/product/:productId', (req, res) => {
  const { productId } = req.params;
  
  db.all(`
    SELECT * FROM reviews 
    WHERE productId = ? AND verified = 1 
    ORDER BY createdAt DESC
  `, [productId], (err, rows) => {
    if (err) {
      console.error('Error fetching product reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    
    res.json(rows);
  });
});

// Approve a review
app.put('/api/reviews/:id/approve', (req, res) => {
  const { id } = req.params;
  
  db.run(`
    UPDATE reviews 
    SET verified = 1, status = 'approved', updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [id], function(err) {
    if (err) {
      console.error('Error approving review:', err);
      return res.status(500).json({ error: 'Failed to approve review' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review approved successfully' });
  });
});

// Reject a review
app.put('/api/reviews/:id/reject', (req, res) => {
  const { id } = req.params;
  
  db.run(`
    UPDATE reviews 
    SET verified = 0, status = 'rejected', updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [id], function(err) {
    if (err) {
      console.error('Error rejecting review:', err);
      return res.status(500).json({ error: 'Failed to reject review' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review rejected successfully' });
  });
});

// Delete a review (admin only)
app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  
  db.run(`DELETE FROM reviews WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Failed to delete review' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  });
});

// Get review statistics for a product
app.get('/api/reviews/stats/:productId', (req, res) => {
  const { productId } = req.params;
  
  db.all(`
    SELECT 
      COUNT(*) as totalReviews,
      AVG(rating) as averageRating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
    FROM reviews 
    WHERE productId = ? AND verified = 1
  `, [productId], (err, rows) => {
    if (err) {
      console.error('Error fetching review stats:', err);
      return res.status(500).json({ error: 'Failed to fetch review statistics' });
    }
    
    const stats = rows[0];
    res.json({
      totalReviews: stats.totalReviews || 0,
      averageRating: stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : 0,
      distribution: {
        5: stats.fiveStars || 0,
        4: stats.fourStars || 0,
        3: stats.threeStars || 0,
        2: stats.twoStars || 0,
        1: stats.oneStar || 0
      }
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Review API server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Review API server running on http://localhost:${PORT}`);
  console.log(`Database path: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
