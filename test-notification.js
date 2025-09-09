const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const FCM_TOKEN = 'YOUR_FCM_TOKEN_HERE'; // Replace with actual FCM token

// Test functions
async function testFcmStatus() {
  try {
    console.log('🔍 Checking FCM service status...');
    const response = await axios.get(`${BASE_URL}/notifications/status`);
    console.log('✅ FCM Status:', response.data);
    return response.data.fcmInitialized;
  } catch (error) {
    console.error('❌ Error checking FCM status:', error.response?.data || error.message);
    return false;
  }
}

async function getUsersWithTokens() {
  try {
    console.log('👥 Getting users with FCM tokens...');
    const response = await axios.get(`${BASE_URL}/notifications/users-with-tokens`);
    console.log('✅ Users with tokens:', response.data);
    return response.data.users;
  } catch (error) {
    console.error('❌ Error getting users:', error.response?.data || error.message);
    return [];
  }
}

async function sendTestNotification(fcmToken, title = 'Test Notification', body = 'This is a test notification from NewsAreUs backend') {
  try {
    console.log(`📱 Sending test notification to token: ${fcmToken.substring(0, 20)}...`);
    
    const response = await axios.post(`${BASE_URL}/notifications/test`, {
      fcmToken,
      title,
      body,
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
        source: 'backend_test'
      }
    });
    
    console.log('✅ Test notification result:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Error sending test notification:', error.response?.data || error.message);
    return false;
  }
}

async function sendTestToUser(title = 'Test User Notification', body = 'Hello! This is a test notification for a registered user') {
  try {
    console.log('👤 Sending test notification to a registered user...');
    
    const response = await axios.post(`${BASE_URL}/notifications/test-user`, {
      title,
      body
    });
    
    console.log('✅ Test user notification result:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Error sending test to user:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting FCM Notification Tests...\n');
  
  // Test 1: Check FCM status
  const fcmInitialized = await testFcmStatus();
  if (!fcmInitialized) {
    console.log('❌ FCM service is not initialized. Please check your environment variables.');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Get users with tokens
  const users = await getUsersWithTokens();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Send test notification with provided token
  if (FCM_TOKEN && FCM_TOKEN !== 'YOUR_FCM_TOKEN_HERE') {
    await sendTestNotification(FCM_TOKEN, 'Direct Test', 'This notification was sent directly to your FCM token');
  } else {
    console.log('⚠️  No FCM token provided. Skipping direct token test.');
    console.log('   To test with your FCM token, replace YOUR_FCM_TOKEN_HERE in this file.');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Send test to registered user
  if (users.length > 0) {
    await sendTestToUser('User Test', 'This notification was sent to a registered user in the database');
  } else {
    console.log('⚠️  No users with FCM tokens found in database.');
    console.log('   Please register/login with a user that has an FCM token.');
  }
  
  console.log('\n🎉 Test completed!');
}

// Run tests
runTests().catch(console.error);
