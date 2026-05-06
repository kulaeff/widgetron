import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pulse/ui": path.resolve(__dirname, "src/_mocks_/pulse-ui")
    }
  }
});
