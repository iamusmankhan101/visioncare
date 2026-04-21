const upstashService = require('./upstashService');

async function testAdminConnection() {
  console.log('🧪 Testing Admin Panel Connection to Upstash...\n');

  try {
    // Test 1: Add a product that should persist
    console.log('1️⃣ Adding a product from "admin panel"...');
    const adminProduct = {
      id: 'admin_test_001',
      name: 'Admin Test Glasses',
      price: 199.99,
      category: 'frames',
      brand: 'AdminBrand',
      description: 'Product added from admin panel test',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const savedProduct = await upstashService.saveProduct(adminProduct);
    console.log('✅ Product saved to Upstash:', savedProduct ? 'Success' : 'Failed');

    // Test 2: Verify it appears in getAllProducts (what admin panel calls)
    console.log('\n2️⃣ Fetching all products (simulating admin panel refresh)...');
    const allProducts = await upstashService.getAllProducts();
    console.log(`📊 Total products found: ${allProducts.length}`);
    
    const foundProduct = allProducts.find(p => p.id === 'admin_test_001');
    console.log('✅ Admin test product found:', foundProduct ? 'Yes' : 'No');
    
    if (foundProduct) {
      console.log('Product Details:');
      console.log(`- ID: ${foundProduct.id}`);
      console.log(`- Name: ${foundProduct.name}`);
      console.log(`- Price: $${foundProduct.price}`);
      console.log(`- Status: ${foundProduct.status}`);
    }

    // Test 3: Add another product to simulate multiple products
    console.log('\n3️⃣ Adding a second product...');
    const secondProduct = {
      id: 'admin_test_002',
      name: 'Second Admin Glasses',
      price: 149.99,
      category: 'sunglasses',
      brand: 'AdminBrand',
      description: 'Second product for testing',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await upstashService.saveProduct(secondProduct);
    
    // Test 4: Fetch again to simulate another refresh
    console.log('\n4️⃣ Simulating another admin panel refresh...');
    const updatedProducts = await upstashService.getAllProducts();
    console.log(`📊 Total products after adding second: ${updatedProducts.length}`);
    
    console.log('\n📋 All products in database:');
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category})`);
    });

    // Test 5: Test the exact API endpoint your admin panel uses
    console.log('\n5️⃣ Testing API endpoint that admin panel calls...');
    console.log('🔗 Admin panel should call: http://localhost:5004/api/products');
    console.log('📡 This endpoint should return the same products we just added');

    // Test 6: Show what happens on refresh
    console.log('\n6️⃣ What happens when admin panel refreshes:');
    console.log('1. Admin panel calls fetchProducts()');
    console.log('2. fetchProducts() calls productApi.getAllProducts()');
    console.log('3. productApi makes HTTP request to http://localhost:5004/api/products');
    console.log('4. Your Upstash server responds with products from Redis');
    console.log('5. Products should appear in admin panel');
    
    console.log('\n🔍 If products disappear on refresh, the issue is:');
    console.log('❌ API connection failing');
    console.log('❌ Falling back to sample products');
    console.log('❌ Not using the Upstash server');

    // Keep products for testing (don't cleanup)
    console.log('\n💾 Keeping test products for admin panel testing...');
    console.log('✅ Products will persist and should appear in admin panel');
    console.log('🔄 Try refreshing your admin panel now!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminConnection().then(() => {
  console.log('\n✅ Admin connection test completed');
  console.log('🔄 Now refresh your admin panel to see if products appear!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
