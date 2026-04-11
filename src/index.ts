import { logger } from './common/logger.js';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { setupWorkers } from './jobs/index.js';
import { seedSystemFrameworks } from './modules/CurriculumStructure/seed-frameworks.js';
import app from './app.js';

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'UNCAUGHT EXCEPTION — shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'UNHANDLED REJECTION — shutting down');
  process.exit(1);
});

const start = async () => {
  await connectDatabase();
  await seedSystemFrameworks();

  await setupWorkers();

  const server = app.listen(config.port, () => {
    logger.info(`[Campusly] Server running on port ${config.port} (${config.nodeEnv})`);
    logger.info(`[Campusly] API docs: http://localhost:${config.port}/api-docs`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`\n[Campusly] ${signal} received, shutting down gracefully...`);
    server.close(() => {
      logger.info('[Campusly] HTTP server closed');
      mongoose.connection.close().then(() => {
        logger.info('[Campusly] MongoDB connection closed');
        process.exit(0);
      });
    });
    setTimeout(() => {
      logger.error('[Campusly] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, '[Campusly] Failed to start');
  process.exit(1);
});
