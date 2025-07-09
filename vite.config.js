import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  server: {
    open: '/login.html',
    proxy: {
      '/api': 'http://localhost:3000'  // Optional: Proxy API requests to your backend
    }
  }
})
