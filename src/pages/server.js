const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('../api/reviewsApi');

// Initialize express app
const app = express();

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const productRoutes = require('../routes/productRoutes');
const authRoutes = require('../routes/authRoutes');
const reviewRoutes = require('../routes/reviewRoutes');

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const buildPath = path.join(__dirname, '../../build');
  app.use(express.static(buildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Basic route for testing
app.get('/api', (req, res) => {
  res.send('Eyewearr API is running...');
});

// Add a root route handler for development mode
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.send('Eyewearr API server is running on port 5001. Please use the React development server (http://localhost:3000) to access the frontend.');
  });
}

// Port configuration
const PORT = process.env.PORT || 5001;

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log(`Attempting to start server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();