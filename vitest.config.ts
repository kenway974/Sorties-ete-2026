import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Les specs e2e sont pilotées par Playwright : les collecter ici les fait
    // échouer au chargement (test.describe hors runner Playwright).
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    globals: true,
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/utils/**", "src/lib/hooks/**", "src/components/**"],
      exclude: ["**/*.d.ts", "**/index.ts", "src/components/map/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
