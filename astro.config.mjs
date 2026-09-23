// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: [
        '@astrojs/cloudflare',
        '@astrojs/cloudflare/entrypoints/server',
        '@astrojs/cloudflare/entrypoints/server.advanced',
        '@astrojs/cloudflare/entrypoints/server.directory',
        '@astrojs/cloudflare/image-service-workerd',
      ]
    },
    ssr: {
      optimizeDeps: {
        exclude: [
          '@astrojs/cloudflare',
          '@astrojs/cloudflare/entrypoints/server',
          '@astrojs/cloudflare/entrypoints/server.advanced',
          '@astrojs/cloudflare/entrypoints/server.directory',
          '@astrojs/cloudflare/image-service-workerd',
        ]
      },
      noExternal: ['@astrojs/cloudflare']
    }
  },
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.jsonc'
    }
  })
});