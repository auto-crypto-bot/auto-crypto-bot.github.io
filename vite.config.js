import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['lightweight-charts'],
          'ui-vendor': ['lucide-react']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api/v3': {
        target: 'https://api.mexc.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
