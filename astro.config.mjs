// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
  site: 'https://dm-js-dev.github.io/favicon-forge/',
  base: '/favicon-forge/',
  build: {
    inlineStylesheets: 'never',
  },
});
