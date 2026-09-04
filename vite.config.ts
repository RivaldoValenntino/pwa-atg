import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tanstackRouter from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({}),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets', // Ambil dari folder ini
          dest: 'src'        // Salin ke folder dist/src/assets
        }
      ]
    }),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      manifest: {
        name: "Aurora Absensi",
        short_name: "Aurora Absensi",
        description: "Aplikasi PWA Aurora Absensi",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        scope: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },


    }),
  ],

  server: {
    allowedHosts: ["pwa.atg.aurorasystem.co.id", "pwa.aurorateknoglobal.com", "d556-202-138-250-16.ngrok-free.app"],
  },
});
