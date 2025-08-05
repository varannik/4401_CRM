// Test script for email webhook endpoint
const testWebhook = async () => {
  const testEmail = {
    messageId: `test-${Date.now()}`,
    from: {
      name: "Test User",
      email: "test@example.com"
    },
    to: [
      {
        name: "CRM System", 
        email: "crm@44point01.com"
      }
    ],
    subject: "Test Email from Webhook",
    date: new Date().toISOString(),
    threadId: `thread-${Date.now()}`,
    importance: "normal",
    attachments: []
  };

  try {
    const response = await fetch('http://localhost:3000/api/email-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_WEBHOOK_SECRET || 'test-secret'}`
      },
      body: JSON.stringify(testEmail)
    });

    const result = await response.json();
    console.log('✅ Webhook Response:', result);
    console.log('📊 Status Code:', response.status);
    
  } catch (error) {
    console.error('❌ Webhook Test Failed:', error);
  }
};

// Health check test
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/email-webhook', {
      method: 'GET'
    });
    
    const result = await response.json();
    console.log('🏥 Health Check:', result);
    
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
  }
};

// Run tests
console.log('🧪 Testing Email Webhook Endpoint...\n');

testHealth().then(() => {
  console.log('\n📧 Testing Email Processing...\n');
  return testWebhook();
});