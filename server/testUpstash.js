const upstashService = require('./upstashService');

async function testUpstashConnection() {
  console.log('🧪 Testing Upstash Redis Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const health = await upstashService.healthCheck();
    console.log('Health Status:', health);
    
    if (health.status !== 'connected') {
      console.log('❌ Upstash connection failed');
      return;
    }
    
    console.log('✅ Upstash connected successfully!\n');

    // Test 2: Save a test product
    console.log('2️⃣ Testing product save...');
    const testProduct = {
      id: 'test_product_001',
      name: 'Test Eyeglasses',
      price: 99.99,
      category: 'frames',
      brand: 'TestBrand',
      description: 'Test product for Upstash integration'
    };
    
    const savedProduct = await upstashService.saveProduct(testProduct);
    console.log('Saved Product:', savedProduct ? '✅ Success' : '❌ Failed');

    // Test 3: Retrieve the product
    console.log('3️⃣ Testing product retrieval...');
    const retrievedProduct = await upstashService.getProduct('test_product_001');
    console.log('Retrieved Product:', retrievedProduct ? '✅ Success' : '❌ Failed');
    
    if (retrievedProduct) {
      console.log('Product Details:', {
        id: retrievedProduct.id,
        name: retrievedProduct.name,
        price: retrievedProduct.price
      });
    }

    // Test 4: Get all products
    console.log('4️⃣ Testing get all products...');
    const allProducts = await upstashService.getAllProducts();
    console.log(`All Products: ✅ Found ${allProducts.length} products`);

    // Test 5: Cache test
    console.log('5️⃣ Testing cache functionality...');
    const cacheKey = 'test_cache_key';
    const cacheValue = { message: 'Hello from Upstash cache!', timestamp: new Date().toISOString() };
    
    const cacheSet = await upstashService.setCache(cacheKey, cacheValue, 300); // 5 minutes
    console.log('Cache Set:', cacheSet ? '✅ Success' : '❌ Failed');
    
    const cachedValue = await upstashService.getCache(cacheKey);
    console.log('Cache Get:', cachedValue ? '✅ Success' : '❌ Failed');
    
    if (cachedValue) {
      console.log('Cached Value:', cachedValue);
    }

    // Test 6: Counter test
    console.log('6️⃣ Testing counter functionality...');
    const counterKey = 'test_counter';
    const count1 = await upstashService.incrementCounter(counterKey);
    const count2 = await upstashService.incrementCounter(counterKey);
    console.log(`Counter Test: ${count1} → ${count2} ✅ Success`);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await upstashService.deleteProduct('test_product_001');
    await upstashService.deleteCache(cacheKey);
    console.log('✅ Cleanup complete');

    console.log('\n🎉 All Upstash tests passed! Your database is ready to use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testUpstashConnection().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
