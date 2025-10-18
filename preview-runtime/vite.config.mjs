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
    },
    fs: {
      // Allow serving files from anywhere (needed for previewing components from different workspaces)
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@component': 'c:/development/green-state-psych/ui/src/app/components'
    }
  },
});
