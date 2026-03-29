import mongoose from 'mongoose';
import { config } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export async function connectDatabase(): Promise<void> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(config.mongodb.uri);
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(
        `MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error
      );

      if (retries >= MAX_RETRIES) {
        console.error('MongoDB max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
