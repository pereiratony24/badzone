import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Charge toutes les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  // Détection fiable de l'environnement DEV :
  // 1. Branche Vercel égale à 'dev'
  // 2. Ou URL Supabase pointant sur badzone-dev
  // 3. Ou mode local 'development'
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
        manifest: {
          name: appName,
          short_name: appName,
          description: 'Gestion des séances et tournois de badminton',
          theme_color: '#0B0914',
          background_color: '#0B0914',
          display: 'standalone',
          orientation: 'any',
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
      host: true,
      allowedHosts: true,
    },
  };
});