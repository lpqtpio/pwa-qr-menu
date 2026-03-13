import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png"
      ],

      manifest: {
        name: "QR Menu",
        short_name: "QRMenu",
        description: "Fast QR digital restaurant menu",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/room-service.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/restaurant-9118242.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }, 
          {
            src:"/apple-touch-icon.png",
            sizes:"192x192",
            type:"image/png"
          },
        ]
      },
      devOptions:{
           enabled: true, 
           type: "module",
           suppressWarnings: true 
      },

      workbox: {

        globPatterns: [
          "**/*.{js,css,html,png,svg,json}"
        ],

        runtimeCaching: [

          {
            urlPattern: ({ request }) =>
              request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages"
            }
          },

          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets"
            }
          },

          {
            urlPattern: ({ request }) =>
              request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },

          {
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3
            }
          }

        ]

      }

    })

  ],

  build: {
    outDir: "dist",
    emptyOutDir: true
  }
})