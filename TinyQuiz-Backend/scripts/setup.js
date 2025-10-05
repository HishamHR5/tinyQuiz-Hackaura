#!/usr/bin/env node

/**
 * TinyQuiz Backend Setup Script
 * This script helps set up the environment for the first time
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 TinyQuiz Backend Setup\n');

// Environment template
const envTemplate = `# =============================================================================
# TinyQuiz Backend - Environment Configuration
# =============================================================================
# Generated on: ${new Date().toISOString()}

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# MongoDB connection string
# For local MongoDB: mongodb://localhost:27017/tinyquiz
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/tinyquiz
MONGO_URI=mongodb://localhost:27017/tinyquiz

# =============================================================================
# JWT AUTHENTICATION
# =============================================================================
# Secret key for JWT token signing (auto-generated secure key)
JWT_SECRET=${crypto.randomBytes(64).toString('hex')}

# =============================================================================
# AI PROVIDERS CONFIGURATION
# =============================================================================
# Choose one or both AI providers for quiz generation

# 1. GOOGLE GEMINI AI
# Get your free API key from Google AI Studio
# Visit: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# 2. NVIDIA NEMOTRON/LLAMA (Free tier available)
# Get your free API key from NVIDIA
# Visit: https://integrate.api.nvidia.com/
NVIDIA_API_KEY=your-nvidia-api-key-here

# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
# Port for the server to run on
PORT=5000

# Node environment
NODE_ENV=development

# =============================================================================
# OPTIONAL: ENHANCED FEATURES
# =============================================================================
# Enable detailed API logging
ENABLE_API_LOGGING=true

# Enable request rate limiting
ENABLE_RATE_LIMITING=true

# Maximum requests per IP per window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100

# CORS allowed origins (comma-separated for multiple origins)
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# =============================================================================
# DATABASE CLEANUP CONFIGURATION
# =============================================================================
# Enable automatic cleanup of expired quizzes
ENABLE_AUTO_CLEANUP=true

# Cleanup interval in hours
CLEANUP_INTERVAL_HOURS=24
`;

const envPath = path.join(__dirname, '..', '.env');
const setupInstructions = `
📋 Setup Instructions:

1. ✅ Environment file created: .env
   - JWT_SECRET has been auto-generated (secure random key)
   - Default MongoDB URI set to local instance
   - You need to add at least one AI provider API key

2. 🔑 Get your AI Provider API Keys:
   
   Option A - Google Gemini (Recommended):
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key and copy it
   - Replace: your-gemini-api-key-here
   
   Option B - NVIDIA Nemotron/LLaMA (Free tier):
   - Go to: https://integrate.api.nvidia.com/
   - Sign up for free access
   - Get your API key from the dashboard
   - Replace: your-nvidia-api-key-here
   
   💡 Tip: You can configure both for maximum flexibility!

3. 🗄️ Database Setup:
   Option A - Local MongoDB:
   - Install MongoDB: https://docs.mongodb.com/manual/installation/
   - Start MongoDB service
   - Keep MONGO_URI as: mongodb://localhost:27017/tinyquiz

   Option B - MongoDB Atlas (Cloud):
   - Create account: https://www.mongodb.com/atlas
   - Create cluster and get connection string
   - Replace MONGO_URI in .env file

4. 🏃‍♂️ Start the server:
   npm run dev

5. 🧪 Test the setup:
   npm run health
   npm test

⚠️  IMPORTANT: 
- Never commit .env file to version control
- Keep your API keys secure
- Use strong JWT secrets in production

🎯 You're almost ready! Just add your Gemini API key and you're good to go!
`;

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   Backup created as .env.backup');
    
    // Create backup
    fs.copyFileSync(envPath, envPath + '.backup');
  }

  // Write the new .env file
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Environment file created successfully!');
  
  console.log(setupInstructions);

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔧 Manual setup required:');
  console.log('1. Create .env file in project root');
  console.log('2. Copy the template from SETUP.md');
  console.log('3. Generate JWT secret: npm run generate-secret');
  console.log('4. Add your Gemini API key');
  process.exit(1);
}

// Check dependencies
console.log('\n🔍 Checking dependencies...');
try {
  require('mongoose');
  require('express');
  require('jsonwebtoken');
  require('bcryptjs');
  require('axios');
  console.log('✅ All dependencies installed');
} catch (error) {
  console.log('❌ Missing dependencies. Run: npm install');
}

console.log('\n🎉 Setup complete! Run "npm run dev" to start the server.');