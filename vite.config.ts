import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (.env.local, .env, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Détecte si on pointe vers la base dev ou si on est en local
  const isDev = env.VITE_SUPABASE_URL?.includes('dev') || mode === 'development';
  const iconSuffix = isDev ? 'dev' : 'prod';
  const appName = isDev ? 'BadZone (DEV)' : 'BadZone';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: appName,
          short_name: appName,
          description: 'Gestion des séances et tournois de badminton',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: `/icons/icon-${iconSuffix}-192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `/icons/icon-${iconSuffix}-512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: `/icons/icon-${iconSuffix}-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    server: {
      host: true, // Permet d'accéder au site depuis la tablette via le réseau Wi-Fi
      allowedHosts: true, // Autorise localtunnel et tous les sous-domaines
    },
  };
});