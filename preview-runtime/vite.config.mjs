import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
