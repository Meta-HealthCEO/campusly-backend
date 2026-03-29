import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { setupWorkers } from './jobs/index.js';
import app from './app.js';

const start = async () => {
  await connectDatabase();

  await setupWorkers();

  app.listen(config.port, () => {
    console.log(`[Campusly] Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[Campusly] API docs: http://localhost:${config.port}/api-docs`);
  });
};

start().catch((err) => {
  console.error('[Campusly] Failed to start:', err);
  process.exit(1);
});
