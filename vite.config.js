import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const page = (path) => resolve(import.meta.dirname, path);

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    rollupOptions: {
      input: {
        index: page('index.html'),
        cream: page('cream/index.html'),
        griddle: page('griddle/index.html'),
      },
    },
  },
});
