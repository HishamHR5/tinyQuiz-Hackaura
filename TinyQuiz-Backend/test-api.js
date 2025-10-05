const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Test configuration
const testUser = {
  email: `test-${Date.now()}@example.com`, // Unique email to avoid conflicts
  password: 'password123'
};

let authToken = '';
let quizId = '';

async function testAPI() {
  
  
  try {
    // 1. Test User Registration
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    authToken = registerResponse.data.token;
    

    // 2. Test User Login
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    

    // 3. Test Quiz Generation
    
    const quizResponse = await axios.post(
      `${BASE_URL}/quiz/generate`,
      { topic: 'JavaScript Programming' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    quizId = quizResponse.data.id;
    

    // 4. Test Get Quiz
    
    const getQuizResponse = await axios.get(`${BASE_URL}/quiz/${quizId}`);
    

    // 5. Test Quiz Sharing
    
    const sharingResponse = await axios.get(
      `${BASE_URL}/quiz/${quizId}/share`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    

    // 6. Test Submit Quiz
    
    const submitResponse = await axios.post(`${BASE_URL}/quiz/${quizId}/submit`, {
      name: 'Test Student',
      answers: [0, 1, 2, 0, 1]  // Using indices instead of letters
    });
    

    // 7. Test Get Results
    
    const resultsResponse = await axios.get(
      `${BASE_URL}/quiz/${quizId}/results`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    

    

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('🔍 Status:', error.response?.status, error.response?.statusText);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Connection refused! Is the server running?');
      console.error('💡 Start the server with: npm run dev');
    } else if (error.response?.status === 500 && error.response?.data?.error?.includes('GEMINI_API_KEY')) {
      console.error('\n🚨 Gemini API key not configured!');
      console.error('💡 Add your GEMINI_API_KEY to the .env file');
      console.error('   Get your key from: https://makersuite.google.com/app/apikey');
    } else if (error.response?.status === 500 && error.response?.data?.error?.includes('MongoDB')) {
      console.error('\n🚨 Database connection failed!');
      console.error('💡 Check your MONGO_URI in the .env file');
      console.error('   Ensure MongoDB is running if using local instance');
    }
    
    process.exit(1);
  }
}

// Run the tests
testAPI(); 