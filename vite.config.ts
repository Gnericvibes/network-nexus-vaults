
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
    exclude: [
      '@privy-io/react-auth',
      '@walletconnect/time',
      '@walletconnect/window-getters',
      '@walletconnect/relay-auth',
    ],
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
      include: [
        /bn\.js/, 
        /@ethersproject/, 
        /js-sha3/, 
        /eventemitter3/, 
        /@walletconnect/, 
        /node_modules/
      ],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          walletconnect: [
            '@walletconnect/time',
            '@walletconnect/window-getters', 
            '@walletconnect/relay-auth'
          ],
        },
      },
    },
  },
}));
