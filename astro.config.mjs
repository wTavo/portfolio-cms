// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  server: {
    host: true,
    port: 4321
  },
  output: 'server',

  integrations: [
    react()
  ],

  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      }
    }
  },

  adapter: cloudflare({
    imageService: 'passthrough',
  })
});