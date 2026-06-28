import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Tannery-mini-erp/' : '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
}));
