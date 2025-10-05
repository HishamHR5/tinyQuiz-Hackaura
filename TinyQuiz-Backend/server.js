const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const cleanupScheduler = require('./scripts/cleanup');

// 1) Start HTTP server immediately (non-blocking startup)
const server = app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP server listening on 0.0.0.0:${PORT}`);
});

// 2) Connect to MongoDB with retry/backoff (does not block server startup)
const MAX_RETRIES = parseInt(process.env.MONGO_MAX_RETRIES || '30', 10); // ~5 minutes with 10s delay
const RETRY_DELAY_MS = parseInt(process.env.MONGO_RETRY_DELAY_MS || '10000', 10);
let mongoAttempt = 0;

function connectToMongoWithRetry() {
  if (!MONGO_URI) {
    // eslint-disable-next-line no-console
    console.error('MONGO_URI is not set. Skipping MongoDB connection.');
    return;
  }

  mongoAttempt += 1;
  // eslint-disable-next-line no-console
  console.log(`Connecting to MongoDB (attempt ${mongoAttempt}/${MAX_RETRIES})...`);

  mongoose.connect(MONGO_URI)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('MongoDB connected successfully');
      // Start scheduled jobs only after DB is ready
      try {
        cleanupScheduler.start();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to start cleanup scheduler:', err?.message || err);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err?.message || err);
      if (mongoAttempt < MAX_RETRIES) {
        setTimeout(connectToMongoWithRetry, RETRY_DELAY_MS);
      } else {
        // eslint-disable-next-line no-console
        console.error('Max MongoDB connection attempts reached; continuing to run without DB.');
      }
    });
}

connectToMongoWithRetry();

// 3) Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received. Closing HTTP server...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP server closed.');
  });
  mongoose.connection.close()
    .catch(() => {})
    .finally(() => process.exit(0));
});
