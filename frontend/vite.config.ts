import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
      '@components': `${import.meta.dirname}/src/components`,
      '@hooks': `${import.meta.dirname}/src/hooks`,
      '@lib': `${import.meta.dirname}/src/lib`,
      '@services': `${import.meta.dirname}/src/services`,
      '@context': `${import.meta.dirname}/src/context`,
      '@pages': `${import.meta.dirname}/src/pages`,
      '@types': `${import.meta.dirname}/src/types`,
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Forward /api calls to the backend server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  },
})
