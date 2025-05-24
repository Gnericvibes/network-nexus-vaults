
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
      // Add specific alias for bn.js to ensure proper resolution
      "bn.js": path.resolve(__dirname, "./node_modules/bn.js/lib/bn.js"),
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
      '@ethersproject/providers'
    ],
    esbuildOptions: {
      // Define global for compatibility
      define: {
        global: 'globalThis',
      },
      // Handle CommonJS modules properly
      plugins: [],
    },
  },
  build: {
    commonjsOptions: {
      include: [/bn\.js/, /node_modules/],
      transformMixedEsModules: true,
      // Specifically handle bn.js exports
      namedExports: {
        'bn.js': ['BN'],
      },
    },
    rollupOptions: {
      // Ensure external dependencies are handled correctly
      external: [],
      output: {
        // Handle global variables in the build
        globals: {
          'bn.js': 'BN',
        },
      },
    },
  },
}));
