
import './polyfills/global.js'; // Make sure this is the first import
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log that polyfills are loaded in main
console.log("Main module loaded with polyfills:", {
  buffer: !!window.Buffer,
  util: !!window.util,
  utilInherits: typeof window.util.inherits === 'function'
});

createRoot(document.getElementById("root")!).render(<App />);
