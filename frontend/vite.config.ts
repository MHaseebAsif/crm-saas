import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_AUTH_URL': JSON.stringify('http://localhost:8001'),
    'import.meta.env.VITE_USER_URL': JSON.stringify('http://localhost:8002'),
    'import.meta.env.VITE_CRM_URL': JSON.stringify('http://localhost:8003'),
    'import.meta.env.VITE_NOTIFICATION_URL': JSON.stringify('http://localhost:8004'),
  },
})
