import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8000,
    allowedHosts: [
      '4de94f417a058019d264f85343647589458fdc91-8000.dstack-pha-prod9.phala.network',
      '.dstack-pha-prod9.phala.network',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Preserve the original host for WebAuthn
            if (req.headers.host) {
              proxyReq.setHeader('x-forwarded-host', req.headers.host);
            }
          });
        },
      },
    },
  },
})
