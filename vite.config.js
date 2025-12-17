import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  
  // Excluir code.html del escaneo de dependencias
  optimizeDeps: {
    exclude: ['code.html']
  },
  
  server: {
    host: '0.0.0.0', // ✅ CRÍTICO: Permite que Docker exponga el servidor correctamente
    port: 5173,
    strictPort: true,
    open: false,
    watch: {
      usePolling: true, // ✅ Mejora el hot reload en Docker
    },
    proxy: {},
  },
  
  // Configuración para preview/producción
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
  }
})