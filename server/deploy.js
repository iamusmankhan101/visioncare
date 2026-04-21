#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Backend Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'productServer.js',
  'products.db',
  'railway.json',
  'Procfile'
];

console.log('✅ Checking deployment files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the files above.');
  process.exit(1);
}

console.log('\n🎉 All deployment files are ready!');
console.log('\n📋 Next Steps:');
console.log('1. Choose a deployment platform:');
console.log('   • Railway (Recommended): https://railway.app');
console.log('   • Heroku: https://heroku.com');
console.log('   • Render: https://render.com');
console.log('');
console.log('2. Follow the deployment guide in BACKEND_DEPLOYMENT.md');
console.log('');
console.log('3. After deployment, update your frontend with:');
console.log('   REACT_APP_PRODUCTS_API_URL=https://your-backend-url.com/api');
console.log('');
console.log('4. Test your API health endpoint:');
console.log('   https://your-backend-url.com/api/health');
console.log('');
console.log('🚀 Ready to deploy!');
