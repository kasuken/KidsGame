import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: 'Garden Guardians',
        short_name: 'Garden',
        description: 'Grow a flower team and keep the strawberry garden safe.',
        theme_color: '#173e32',
        background_color: '#f7f4df',
        display: 'standalone',
        orientation: 'landscape',
        icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
});
