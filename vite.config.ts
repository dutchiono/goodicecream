import { defineConfig } from 'vite';

export default defineConfig({
  // PWA/service-worker generation is intentionally disabled while the game is
  // under active development. Safari was serving stale cached bundles after
  // deploys, which made audio and UI changes appear not to update.
  server: {
    port: 5173,
    host: true
  }
});
