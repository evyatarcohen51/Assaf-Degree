import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Got Schooled',
        short_name: 'Schooled',
        description: 'ניהול לימודים אישי',
        lang: 'he',
        dir: 'rtl',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#FFF6EA',
        theme_color: '#2A2A2A',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
      },
    }),
  ],
});
