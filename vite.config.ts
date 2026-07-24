import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/dashboard-data': {
        target: 'http://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io',
        changeOrigin: true,
        secure: false, 
        rewrite: (path) => path.replace(/^\/api\/dashboard-data/, '/webhook/dashboard-data'),
      },
      '/api/dashboard-ia-summary': {
        target: 'http://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io',
        changeOrigin: true,
        secure: false, 
        rewrite: (path) => path.replace(/^\/api\/dashboard-ia-summary/, '/webhook/dashboard-ia-summary'),
      }
    }
  }
})
