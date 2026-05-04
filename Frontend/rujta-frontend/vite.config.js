import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
    proxy: {
      "/api": {
        target: "https://localhost:7065",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/hubs": {
        target: "https://localhost:7065",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
