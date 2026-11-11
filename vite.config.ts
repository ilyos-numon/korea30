import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
// 출처: https://github.com/vite-pwa/vite-plugin-pwa (MIT)
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // 등록은 src/pwa/PwaUpdate.tsx 의 useRegisterSW
      manifest: {
        name: 'Korea30',
        short_name: 'Korea30',
        description: 'Korea first 30 days',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#f6f5f1',
        background_color: '#f6f5f1',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ttf,mp3,webmanifest}'],
        globIgnores: ['tessdata/**', '**/tesseract-core*', '**/worker.min*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/tessdata/') ||
              /\/assets\/(tesseract-core|worker\.min)[^/]*$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'k30-ocr', expiration: { maxEntries: 6 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
