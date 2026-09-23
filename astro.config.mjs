// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',

  integrations: [
    react()
  ],

  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.jsonc'
    }
  })
});