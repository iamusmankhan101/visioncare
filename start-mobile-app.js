#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Eyewearr Mobile Admin App...\n');

// Function to start a process
const startProcess = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('error', (error) => {
      console.error(`Error starting ${command}:`, error.message);
      reject(error);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`${command} exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve();
      }
    });

    return process;
  });
};

// Check if we're in the right directory
const checkDirectory = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const serverDirPath = path.join(process.cwd(), 'server');
  
  try {
    require(packageJsonPath);
    require('fs').accessSync(serverDirPath);
    return true;
  } catch (error) {
    console.error('❌ Please run this script from the project root directory');
    console.error('   Make sure you have package.json and server/ directory');
    return false;
  }
};

// Main function
const main = async () => {
  if (!checkDirectory()) {
    process.exit(1);
  }

  console.log('📋 Setup Instructions:');
  console.log('1. Starting Push Notification Server...');
  console.log('2. You can then start the React app with: npm start');
  console.log('3. Access the mobile app at: http://localhost:3000/admin/mobile/test');
  console.log('');

  try {
    // Start the push notification server
    console.log('🔔 Starting Push Notification Server on port 5004...');
    
    const serverProcess = spawn('node', ['server/simplePushServer.js'], {
      stdio: 'inherit',
      shell: true
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start push notification server:', error.message);
      console.log('\n🔧 Manual setup:');
      console.log('1. Open a terminal and run: cd server');
      console.log('2. Run: node simplePushServer.js');
      console.log('3. In another terminal, run: npm start');
      console.log('4. Go to: http://localhost:3000/admin/mobile/test');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    console.log('✅ Push Notification Server started!');
    console.log('');
    console.log('🌐 Server URLs:');
    console.log('   Health Check: http://localhost:5004/api/health');
    console.log('   Debug Info: http://localhost:5004/api/debug');
    console.log('');
    console.log('📱 Next Steps:');
    console.log('1. Open another terminal');
    console.log('2. Run: npm start');
    console.log('3. Go to: http://localhost:3000/admin/mobile/test');
    console.log('');
    console.log('Press Ctrl+C to stop the server');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();