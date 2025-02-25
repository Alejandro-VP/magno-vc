import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  publicDir: 'public',
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: 5173,  // El puerto que normalmente usa Vite
  }
});
