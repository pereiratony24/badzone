import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Permet d'accéder au site depuis la tablette via le réseau Wi-Fi
    allowedHosts: true, // Autorise localtunnel et tous les sous-domaines
  },
});