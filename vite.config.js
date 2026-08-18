import { defineConfig } from 'vite';

export default defineConfig({
  // Относительные URL работают и на VK Hosting, и при публикации в подпапке.
  base: './',
  build: {
    target: 'es2019',
  },
});
