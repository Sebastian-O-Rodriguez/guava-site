// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind()],
  site: 'https://guavaai.ai', // ensures Astro.site is populated
  redirects: {
    '/backroom-automation': '/operations-automation',
    '/solutions/backroom-automation': '/operations-automation',
    '/inventory-intelligence': '/guava-bi',
    '/solutions/inventory-intelligence': '/guava-bi',
  },
});