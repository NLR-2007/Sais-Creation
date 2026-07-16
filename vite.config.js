import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Keep Vite's generated dependency files away from node_modules, which can
  // be held open by Windows scanners and cause EPERM errors during re-bundling.
  cacheDir: '.vite-cache',
  plugins: [tailwindcss(), react()],
  server: {
    // Firebase authorizes localhost for local OAuth, but not 127.0.0.1 by default.
    host: 'localhost',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react'
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'vendor-firebase'
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
        },
      },
    },
  },
})
