const upstashService = require('./upstashService');

async function realTimeDebug() {
  console.log('🔍 Real-time Product Debug - Monitoring Upstash...\n');

  try {
    // Step 1: Show current products
    console.log('1️⃣ Current products in Upstash:');
    const currentProducts = await upstashService.getAllProducts();
    console.log(`📊 Total: ${currentProducts.length} products`);
    
    if (currentProducts.length > 0) {
      currentProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (ID: ${product.id})`);
      });
    } else {
      console.log('   📦 No products found in database');
    }

    // Step 2: Monitor for changes
    console.log('\n2️⃣ Monitoring for new products...');
    console.log('🔄 Add a product in your admin panel now!');
    console.log('⏰ Checking every 2 seconds for changes...\n');

    let previousCount = currentProducts.length;
    let checkCount = 0;
    const maxChecks = 30; // Check for 1 minute

    const monitor = setInterval(async () => {
      checkCount++;
      
      try {
        const products = await upstashService.getAllProducts();
        const newCount = products.length;
        
        if (newCount !== previousCount) {
          console.log(`\n🎉 CHANGE DETECTED! Products: ${previousCount} → ${newCount}`);
          
          if (newCount > previousCount) {
            // New product added
            const newProducts = products.filter(p => 
              !currentProducts.some(cp => cp.id === p.id)
            );
            
            newProducts.forEach(product => {
              console.log(`✅ NEW PRODUCT ADDED:`);
              console.log(`   📦 Name: ${product.name}`);
              console.log(`   💰 Price: $${product.price}`);
              console.log(`   🆔 ID: ${product.id}`);
              console.log(`   📅 Created: ${product.createdAt || 'Unknown'}`);
            });
          }
          
          previousCount = newCount;
          
          // Show all current products
          console.log('\n📋 All products now:');
          products.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
          });
        } else {
          // Show progress dots
          process.stdout.write('.');
        }
        
        if (checkCount >= maxChecks) {
          console.log('\n\n⏰ Monitoring timeout reached');
          clearInterval(monitor);
          
          if (newCount === previousCount) {
            console.log('\n❌ NO CHANGES DETECTED');
            console.log('🔍 This means:');
            console.log('   1. Product is not reaching the Upstash database');
            console.log('   2. API call is failing');
            console.log('   3. Redux action is not calling the API');
            console.log('   4. Admin panel is using localStorage instead');
            console.log('\n💡 Check your browser console for errors!');
          }
          
          process.exit(0);
        }
      } catch (error) {
        console.error(`❌ Error during monitoring: ${error.message}`);
      }
    }, 2000);

    // Also test the API endpoint directly
    setTimeout(async () => {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:5004/api/products');
        const result = await response.json();
        
        console.log(`\n🔗 API Test: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        if (result.success) {
          console.log(`📊 API returned ${result.data.length} products`);
        }
      } catch (apiError) {
        console.log(`\n❌ API Test failed: ${apiError.message}`);
      }
    }, 5000);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the real-time debug
realTimeDebug();
