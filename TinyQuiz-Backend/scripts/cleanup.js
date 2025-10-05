const cron = require('node-cron');
const Quiz = require('../models/quiz');

// Schedule to run every hour
const cleanupJob = cron.schedule('0 * * * *', async () => {
  try {
    await Quiz.cleanupExpired();
  } catch (error) {
    // Silently handle cleanup errors in production
  }
});

module.exports = {
  start: () => {
    cleanupJob.start();
  },
  stop: () => {
    cleanupJob.stop();
  }
};
