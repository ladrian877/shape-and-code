import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false })],

  // Las imágenes se optimizan con `astro:assets` a través de `<Img>`
  // (`src/components/Img.astro`). El formato y la calidad se deciden allí y en
  // `src/config/imagePresets.ts`, no aquí: esto es solo el motor.
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Si algún día entran imágenes remotas (CMS, CDN), se autorizan aquí:
    // domains: ['ejemplo.com'],
  },
});
