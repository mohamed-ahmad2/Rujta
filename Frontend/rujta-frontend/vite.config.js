import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    https: false, 
    port: 5173,
  },
  plugins: [react()],
});
