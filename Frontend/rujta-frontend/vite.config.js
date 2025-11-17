import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    https: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:7065",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});

