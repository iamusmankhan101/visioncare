// Temporary redirect to correct server location
// This file exists only to handle cached deployment configurations
console.log('🔄 Redirecting to correct server location...');
console.log('📍 Current working directory:', process.cwd());
console.log('📂 Looking for server at: server/simpleServer.js');

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Get the correct path to the server file
const serverPath = path.resolve(__dirname, '../../server/simpleServer.js');
console.log('🎯 Server path resolved to:', serverPath);

// Check if the server file exists
if (fs.existsSync(serverPath)) {
  console.log('✅ Server file found, starting with spawn...');
  
  // Use spawn to start the server as a separate process
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit', // Pass through stdout/stderr
    cwd: path.resolve(__dirname, '../..') // Set working directory to project root
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server process:', error.message);
    console.log('💡 Please update your deployment configuration to use: node server/simpleServer.js');
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    console.log(`🛑 Server process exited with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('🛑 Terminating server...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Terminating server...');
    serverProcess.kill('SIGTERM');
  });

} else {
  console.error('❌ Server file not found at:', serverPath);
  console.log('💡 Please ensure the server directory exists and contains simpleServer.js');
  console.log('💡 Or update your deployment configuration to use: node server/simpleServer.js');
  process.exit(1);
}
