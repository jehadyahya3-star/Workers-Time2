const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const targetPlugins = `    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'نظام إدارة المعدات والمشاريع',
          short_name: 'إدارة المعدات',
          description: 'نظام متكامل لإدارة المعدات والمشاريع وحركة الديزل والتقارير اليومية',
          theme_color: '#0f172a',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
    ],`;

const replacePlugins = `    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'نظام إدارة المعدات',
          short_name: 'إدارة المعدات',
          description: 'نظام متكامل لإدارة المعدات والمشاريع',
          theme_color: '#0f172a',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: '/pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
    ],`;

code = code.replace(targetPlugins, replacePlugins);
fs.writeFileSync('vite.config.ts', code);
console.log("Success patch vite.config.ts");
