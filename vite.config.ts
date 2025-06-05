
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
      '@walletconnect/time'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/bn\.js/, /@ethersproject/, /js-sha3/, /eventemitter3/, /@walletconnect/, /node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: (id) => {
        // Force these packages to be treated as having default exports
        if (id.includes('bn.js') || id.includes('js-sha3') || id.includes('eventemitter3') || id.includes('@walletconnect')) {
          return true;
        }
        return 'auto';
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          walletconnect: ['@walletconnect/time'],
        },
      },
    },
  },
}));
