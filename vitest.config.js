import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment for DOM testing
    environment: 'jsdom',

    // Only run .test.js files, not .spec.js (those are for Playwright)
    include: ['tests/**/*.test.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],

      // 100% coverage enforcement
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,

      // Files to include in coverage
      include: ['src/**/*.js'],

      // Files to exclude from coverage
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    }
  }
});
