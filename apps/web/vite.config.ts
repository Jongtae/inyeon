import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { repositoryBasePath } from './src/lib/routing.ts';

const base = process.env.VITE_BASE_PATH ?? repositoryBasePath(process.env.GITHUB_REPOSITORY);

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
