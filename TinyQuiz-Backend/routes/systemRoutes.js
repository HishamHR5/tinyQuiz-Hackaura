const express = require('express');
const { getAvailableProviders } = require('../utils/aiProviders');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'TinyQuiz Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    name: 'TinyQuiz API',
    version: '1.0.0',
    description: 'Backend API for TinyQuiz application',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      providers: '/api/providers',
      auth: '/api/auth',
      quiz: '/api/quiz'
    }
  });
});

// AI providers endpoint
router.get('/providers', (req, res) => {
  try {
    const providers = getAvailableProviders();
    res.status(200).json({
      ...providers,
      message: 'Available AI providers for quiz generation'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve AI providers' });
  }
});

module.exports = router;