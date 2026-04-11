import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    
    port: 5173,
    hmr: {
      protocol: "wss",
      host: "localhost",
      port: 5173,
    },
    proxy: {
      "/api": {
        target:"https://rujta.runasp.net",

        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
      "/hubs": {
        target: "https://rujta.runasp.net",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});