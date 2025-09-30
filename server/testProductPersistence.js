const upstashService = require('./upstashService');

async function testProductAddAndRefresh() {
  console.log('🧪 Testing Product Add → Refresh Persistence...\n');

  try {
    // Step 1: Check current products
    console.log('1️⃣ Checking current products in database...');
    const initialProducts = await upstashService.getAllProducts();
    console.log(`📊 Current products in database: ${initialProducts.length}`);
    
    if (initialProducts.length > 0) {
      console.log('📋 Existing products:');
      initialProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
      });
    }

    // Step 2: Add a new product (simulating admin panel add)
    console.log('\n2️⃣ Adding a new product (simulating admin panel)...');
    const newProduct = {
      id: `test_${Date.now()}`,
      name: 'Test Persistence Glasses',
      price: 199.99,
      category: 'frames',
      brand: 'TestBrand',
      description: 'Testing if products persist after refresh',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const savedProduct = await upstashService.saveProduct(newProduct);
    console.log('✅ Product added:', savedProduct ? 'Success' : 'Failed');
    
    if (savedProduct) {
      console.log(`   📦 Added: ${savedProduct.name} (ID: ${savedProduct.id})`);
    }

    // Step 3: Immediately fetch all products (simulating refresh)
    console.log('\n3️⃣ Fetching all products (simulating admin panel refresh)...');
    const afterAddProducts = await upstashService.getAllProducts();
    console.log(`📊 Products after add: ${afterAddProducts.length}`);
    
    const foundNewProduct = afterAddProducts.find(p => p.id === newProduct.id);
    console.log('✅ New product found after refresh:', foundNewProduct ? 'YES' : 'NO');
    
    if (foundNewProduct) {
      console.log(`   📦 Found: ${foundNewProduct.name} - $${foundNewProduct.price}`);
    }

    // Step 4: Test the exact API endpoints your admin panel uses
    console.log('\n4️⃣ Testing API endpoints (what admin panel actually calls)...');
    
    // Test the API server directly
    try {
      const fetch = (await import('node-fetch')).default;
      
      // Test GET /api/products
      console.log('🔗 Testing GET http://localhost:5004/api/products');
      const getResponse = await fetch('http://localhost:5004/api/products');
      const getResult = await getResponse.json();
      
      if (getResult.success && getResult.data) {
        console.log(`✅ API GET: Found ${getResult.data.length} products`);
        const apiFoundProduct = getResult.data.find(p => p.id === newProduct.id);
        console.log('✅ New product in API response:', apiFoundProduct ? 'YES' : 'NO');
      } else {
        console.log('❌ API GET failed:', getResult);
      }
      
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
      console.warn('💡 Make sure your Upstash server is running: npm run dev:upstash');
    }

    // Step 5: Show all current products
    console.log('\n5️⃣ Final product list:');
    const finalProducts = await upstashService.getAllProducts();
    finalProducts.forEach((product, index) => {
      const isNew = product.id === newProduct.id;
      console.log(`   ${index + 1}. ${product.name} - $${product.price} ${isNew ? '← NEW' : ''}`);
    });

    // Step 6: Diagnosis
    console.log('\n🔍 Diagnosis:');
    if (foundNewProduct) {
      console.log('✅ Product persistence is working correctly');
      console.log('✅ Products are being saved to Upstash Redis');
      console.log('✅ Products are being retrieved correctly');
      console.log('');
      console.log('🤔 If products still disappear in admin panel, the issue might be:');
      console.log('   1. Admin panel is fetching from a different API endpoint');
      console.log('   2. Browser cache is interfering');
      console.log('   3. API connection is failing and falling back to localStorage');
      console.log('   4. Redux state is not being updated properly');
    } else {
      console.log('❌ Product persistence is NOT working');
      console.log('❌ Products are not being saved or retrieved correctly');
    }

    // Don't cleanup - keep the test product for debugging
    console.log('\n💾 Keeping test product for debugging...');
    console.log('🔄 Try adding a product in your admin panel now and see if it persists!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testProductAddAndRefresh().then(() => {
  console.log('\n✅ Product persistence test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
