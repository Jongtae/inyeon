import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { repositoryBasePath } from './src/lib/routing.ts';

const base = process.env.VITE_BASE_PATH ?? repositoryBasePath(process.env.GITHUB_REPOSITORY);
const methodologyReviewBuild = process.env.VITE_METHODOLOGY_REVIEW_BUILD === 'true';

const productionSecurityPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'none'",
  "font-src 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "manifest-src 'none'",
  "media-src 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "worker-src 'none'",
].join('; ');

export default defineConfig(({ command }) => ({
  base,
  plugins: [
    react(),
    {
      name: 'inyeon-production-security-meta',
      apply: 'build',
      transformIndexHtml: {
        order: 'pre',
        handler: () => [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: productionSecurityPolicy,
            },
            injectTo: 'head-prepend',
          },
          {
            tag: 'meta',
            attrs: {
              name: 'referrer',
              content: 'no-referrer',
            },
            injectTo: 'head-prepend',
          },
        ],
      },
    },
  ],
  build: methodologyReviewBuild
    ? {
        rollupOptions: {
          input: {
            main: fileURLToPath(new URL('./index.html', import.meta.url)),
            review: fileURLToPath(new URL('./review.html', import.meta.url)),
          },
        },
      }
    : undefined,
  server: command === 'serve' ? { headers: { 'Cache-Control': 'no-store' } } : undefined,
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
}));
