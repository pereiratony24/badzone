import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charge toutes les variables d'environnement (.env, .env.local, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Détection de l'environnement DEV :
  // 1. Branche Git Vercel égale à 'dev'
  // 2. Ou URL Supabase pointant vers la base de dev
  // 3. Ou mode local 'development' (npm run dev)
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || '';
  const isDev =
    gitBranch === 'dev' ||
    env.VITE_SUPABASE_URL?.includes('dev') ||
    mode === 'development';

  const appName = isDev ? 'BadZone (DEV)' : 'BadZone';
  const iconSuffix = isDev ? 'dev' : 'prod';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: {
          enabled: true, // Permet de tester l'installation PWA et le Service Worker en local
        },
        manifest: {
          name: appName,
          short_name: appName,
          description: 'Gestion des séances et tournois de badminton',
          start_url: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#0B0914',
          theme_color: '#0B0914',
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
      host: true, // Permet d'accéder au serveur local depuis la tablette via le Wi-Fi
      allowedHosts: true, // Autorise localtunnel et tous les sous-domaines
    },
  };
});