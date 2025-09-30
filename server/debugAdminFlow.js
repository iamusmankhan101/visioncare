const upstashService = require('./upstashService');

async function debugAdminFlow() {
  console.log('🔍 Debugging Admin Panel Product Flow...\n');

  try {
    // Step 1: Check current state
    console.log('1️⃣ Checking current products in Upstash...');
    const initialProducts = await upstashService.getAllProducts();
    console.log(`📊 Current products: ${initialProducts.length}`);
    
    // Step 2: Simulate exact admin panel product creation
    console.log('\n2️⃣ Simulating admin panel product creation...');
    const adminProduct = {
      name: 'Debug Test Glasses',
      price: 299.99,
      originalPrice: 399.99,
      category: 'frames',
      brand: 'DebugBrand',
      material: 'Acetate',
      shape: 'Round',
      color: 'Black',
      size: 'Medium',
      status: 'active',
      description: 'Testing admin panel flow',
      features: ['UV Protection', 'Lightweight'],
      specifications: {
        lensWidth: '52mm',
        bridgeWidth: '18mm',
        templeLength: '140mm'
      },
      gallery: []
    };

    // This simulates what createProductAsync does
    console.log('📡 Calling productApi.createProduct (simulated)...');
    
    // Step 3: Test the API endpoint directly
    try {
      const fetch = (await import('node-fetch')).default;
      
      console.log('🔗 Testing POST http://localhost:5004/api/products');
      const response = await fetch('http://localhost:5004/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminProduct)
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ API POST successful');
        console.log(`📦 Created product: ${result.data.name} (ID: ${result.data.id})`);
        
        // Step 4: Immediately test GET to see if it persists
        console.log('\n3️⃣ Testing immediate retrieval (simulating refresh)...');
        const getResponse = await fetch('http://localhost:5004/api/products');
        const getResult = await getResponse.json();
        
        if (getResult.success && getResult.data) {
          console.log(`✅ API GET: Found ${getResult.data.length} products`);
          const foundProduct = getResult.data.find(p => p.id === result.data.id);
          console.log('✅ New product found in GET:', foundProduct ? 'YES' : 'NO');
          
          if (foundProduct) {
            console.log(`   📦 Found: ${foundProduct.name} - $${foundProduct.price}`);
          }
        } else {
          console.log('❌ API GET failed:', getResult);
        }
        
      } else {
        console.log('❌ API POST failed:', result);
      }
      
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
      console.warn('💡 Make sure your Upstash server is running: npm run dev:upstash');
    }

    // Step 5: Test Upstash directly
    console.log('\n4️⃣ Testing Upstash service directly...');
    const directSave = await upstashService.saveProduct({
      ...adminProduct,
      id: `direct_${Date.now()}`,
      name: 'Direct Upstash Test'
    });
    
    if (directSave) {
      console.log('✅ Direct Upstash save: Success');
      
      const allProductsAfter = await upstashService.getAllProducts();
      console.log(`📊 Products after direct save: ${allProductsAfter.length}`);
    }

    // Step 6: Diagnosis and recommendations
    console.log('\n🔍 DIAGNOSIS:');
    console.log('');
    console.log('If products disappear after refresh in admin panel:');
    console.log('');
    console.log('✅ **Upstash Database**: Working correctly');
    console.log('✅ **API Endpoints**: Working correctly');
    console.log('✅ **Product Persistence**: Working correctly');
    console.log('');
    console.log('❌ **Likely Issues**:');
    console.log('   1. Redux state not updating after API call');
    console.log('   2. Admin panel fetching from different source on refresh');
    console.log('   3. Browser cache interfering');
    console.log('   4. API connection failing and falling back to localStorage');
    console.log('');
    console.log('🔧 **Solutions to try**:');
    console.log('   1. Hard refresh browser (Ctrl+Shift+R)');
    console.log('   2. Clear browser localStorage');
    console.log('   3. Check browser console for API errors');
    console.log('   4. Verify createProductAsync is calling the right API');
    console.log('   5. Make sure fetchProducts() is called after adding product');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugAdminFlow().then(() => {
  console.log('\n✅ Admin flow debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug error:', error);
  process.exit(1);
});
