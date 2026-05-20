// Netlify deployment build config — use: npm run build:netlify
// Outputs to .netlify/ for Netlify Edge Functions deployment
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server", preset: "netlify" },
  },
});
