import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Root URL deploy: https://perfusion-xai.github.io/
// Repo is the user/org root site, so base = "/"
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500, // three.js bundles are chunky, expected
  },
});
