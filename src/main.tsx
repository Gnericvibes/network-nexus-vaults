
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App.tsx';
import './index.css';

// Make sure polyfills are the very first import
import './polyfills/global.js';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        defaultChain: 1, // Ethereum mainnet
        supportedChains: [1, 8453, 137], // Ethereum, Base, Polygon
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
