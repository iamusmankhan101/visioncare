// Simple test to check if the push notification server is accessible
const testServer = async () => {
  console.log('🧪 Testing Push Notification Server...\n');
  
  const serverUrl = 'http://localhost:5004';
  
  try {
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${serverUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running!');
      console.log('   Status:', healthData.status);
      console.log('   Service:', healthData.service);
      console.log('   Subscriptions:', healthData.subscriptions);
      console.log('');
    } else {
      console.log('❌ Server responded with error:', healthResponse.status);
      return;
    }
    
    console.log('2. Testing VAPID key endpoint...');
    const vapidResponse = await fetch(`${serverUrl}/api/vapid-public-key`);
    
    if (vapidResponse.ok) {
      const vapidData = await vapidResponse.json();
      console.log('✅ VAPID endpoint working!');
      console.log('   Public Key:', vapidData.publicKey);
      console.log('');
    }
    
    console.log('3. Testing notification endpoint...');
    const notificationResponse = await fetch(`${serverUrl}/api/admin/test-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (notificationResponse.ok) {
      const notificationData = await notificationResponse.json();
      console.log('✅ Test notification sent!');
      console.log('   Message:', notificationData.message);
      console.log('   Success:', notificationData.success);
      console.log('');
    }
    
    console.log('🎉 All tests passed! The server is working correctly.');
    console.log('You can now use the mobile app at: http://localhost:3000/admin/mobile/test');
    
  } catch (error) {
    console.log('❌ Failed to connect to server:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure the server is running:');
    console.log('   cd server');
    console.log('   node simplePushServer.js');
    console.log('');
    console.log('2. Check if port 5004 is available');
    console.log('3. Verify no firewall is blocking the connection');
    console.log('4. Try accessing http://localhost:5004/api/health in your browser');
  }
};

// Run the test
testServer();