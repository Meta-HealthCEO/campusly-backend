import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    globals: false,
    passWithNoTests: true,
    // Integration tests share a single MongoDB; running files in parallel
    // causes collection wipes (deleteMany({})) to clobber each other.
    fileParallelism: false,
  },
});
