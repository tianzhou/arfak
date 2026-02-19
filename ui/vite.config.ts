import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [reactCompiler],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@gen': path.resolve(__dirname, '../server/src/gen'),
    },
  },
  server: {
    proxy: {
      '/arfak.v1.': {
        target: 'http://localhost:3000',
      },
    },
  },
});
