import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const virtualModule = (name: string, content: string) => ({
  name,
  resolveId: (id: string) => (id === name ? name : null),
  load: (id: string) => (id === name ? content : null),
});

export default defineConfig({
  plugins: [react(), tsconfigPaths(), virtualModule("astro:transitions/client", "export const navigate = () => {}")],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**", // Exclude Playwright E2E tests
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
