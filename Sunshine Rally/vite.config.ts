import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: 'Sunshine Rally',
        short_name: 'Rally',
        description: 'Six sunny road trips for little drivers.',
        theme_color: '#102f3b',
        background_color: '#fff8e8',
        display: 'standalone',
        orientation: 'landscape',
        icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg}'] },
    }),
  ],
});
