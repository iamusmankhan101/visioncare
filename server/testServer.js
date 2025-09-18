// Ultra-simple test server
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${req.method} ${path}`);

  // Health check
  if (path === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Test Server',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // VAPID key
  if (path === '/api/vapid-public-key') {
    res.writeHead(200);
    res.end(JSON.stringify({
      publicKey: 'test-key',
      note: 'Test mode'
    }));
    return;
  }

  // Subscribe
  if (path === '/api/admin/subscribe' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Test subscription saved'
    }));
    return;
  }

  // Test notification
  if (path === '/api/admin/test-notification' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Test notification sent successfully!',
      totalSubscriptions: 1
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Test Server Started!');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('✅ Server is ready for testing!');
  console.log('Now try the mobile app test again.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use!`);
    console.log('Try these solutions:');
    console.log('1. Kill the process using the port');
    console.log('2. Use a different port');
    console.log('3. Restart your computer');
  } else {
    console.log('❌ Server error:', error.message);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});