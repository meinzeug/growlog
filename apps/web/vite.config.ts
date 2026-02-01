import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 15000,
    host: true,
    allowedHosts: ['growlog.mooo.com', 'localhost', '127.0.0.1']
  },
  optimizeDeps: {
    include: ['@growlog/shared']
  },
  build: {
    commonjsOptions: {
      include: [/@growlog\/shared/, /node_modules/]
    }
  }
})
