import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/demo/',
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'jspdf', 'jspdf-autotable'],
    esbuildOptions: {
      plugins: [
        {
          name: 'jspdf-optional-deps',
          setup(build) {
            // Stub out jspdf optional dependencies that we don't need
            build.onResolve({ filter: /^(canvg|html2canvas|dompurify)$/ }, () => ({
              path: 'data:text/javascript,export default {}',
              external: true,
            }));
          },
        },
      ],
    },
  },
  server: {
    proxy: {
      '/demo/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/demo/, ''),
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
