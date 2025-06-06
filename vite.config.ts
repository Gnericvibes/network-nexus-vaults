
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    command === 'serve' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    exclude: ['@privy-io/react-auth'],
    include: [
      'bn.js',
      '@ethersproject/bignumber',
      '@ethersproject/bytes',
      '@ethersproject/providers',
      '@ethersproject/keccak256',
      'js-sha3',
      'eventemitter3',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/bn\.js/, /@ethersproject/, /js-sha3/, /eventemitter3/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['@walletconnect/time', '@walletconnect/window-getters'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
}));
