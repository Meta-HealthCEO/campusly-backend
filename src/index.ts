import mongoose from 'mongoose';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { setupWorkers } from './jobs/index.js';
import app from './app.js';

const start = async () => {
  await connectDatabase();

  await setupWorkers();

  const server = app.listen(config.port, () => {
    console.log(`[Campusly] Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[Campusly] API docs: http://localhost:${config.port}/api-docs`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Campusly] ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('[Campusly] HTTP server closed');
      mongoose.connection.close().then(() => {
        console.log('[Campusly] MongoDB connection closed');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('[Campusly] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  console.error('[Campusly] Failed to start:', err);
  process.exit(1);
});
