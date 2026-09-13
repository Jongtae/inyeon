import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typescriptFiles = ['apps/web/**/*.{ts,tsx}'];

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '.playwright-cli/**'],
  },
  {
    ...eslint.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    files: typescriptFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ...reactHooks.configs.flat['recommended-latest'],
    files: ['apps/web/src/**/*.{ts,tsx}'],
  },
  {
    ...reactRefresh.configs.vite,
    files: ['apps/web/src/**/*.{ts,tsx}'],
  },
]);
