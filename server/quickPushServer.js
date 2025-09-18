const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

console.log('🔔 Starting Quick Push Server...');

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    service: 'Quick Push Server',
    subscriptions: 0,
    timestamp: new Date().toISOString()
  });
});

// VAPID key (mock)
app.get('/api/vapid-public-key', (req, res) => {
  console.log('VAPID key requested');
  res.json({ 
    publicKey: 'mock-key-for-testing',
    note: 'Mock key for testing'
  });
});

// Subscribe (mock)
app.post('/api/admin/subscribe', (req, res) => {
  console.log('Subscription received');
  res.json({ 
    success: true, 
    message: 'Mock subscription saved'
  });
});

// Test notification
app.post('/api/admin/test-notification', (req, res) => {
  console.log('Test notification requested');
  res.json({
    success: true,
    message: 'Mock test notification sent successfully!',
    note: 'This is a test notification in mock mode'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Quick Push Server running on http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Ready for mobile app testing!`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Server error:', error.message);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});