
import { useState, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useToast } from '@/hooks/use-toast';
import '../polyfills/global.js';

export const useWalletConnect = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Ensure polyfills are loaded on mount
  useEffect(() => {
    // Force reload polyfills
    const checkPolyfills = () => {
      console.log("Checking polyfills availability:", {
        buffer: !!window.Buffer,
        util: !!window.util,
        utilInherits: typeof window.util.inherits === 'function',
        eventEmitter: !!window.EventEmitter
      });
      
      if (!window.util || typeof window.util.inherits !== 'function') {
        console.warn("Polyfills not properly loaded, reloading...");
        import('../polyfills/global.js');
      }
    };
    
    checkPolyfills();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Double-check polyfills before proceeding
      if (!window.util || typeof window.util.inherits !== 'function') {
        console.log("Reloading polyfills before wallet connection...");
        await import('../polyfills/global.js');
        
        // Verify polyfills again
        console.log("Polyfills status after reload:", {
          buffer: !!window.Buffer,
          util: !!window.util,
          utilInherits: typeof window.util.inherits === 'function',
          eventEmitter: !!window.EventEmitter
        });
      }
      
      let provider;
      try {
        console.log("Initializing WalletConnect provider...");
        
        provider = new WalletConnectProvider({
          rpc: {
            1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Public Infura ID
            137: "https://polygon-rpc.com",
            8453: "https://mainnet.base.org",
          },
          qrcodeModalOptions: {
            mobileLinks: ["metamask", "rainbow", "trust"],
          },
        });
        
        console.log("Provider created, enabling...");
        await provider.enable();
        console.log("Provider enabled successfully");
      } catch (err) {
        console.error("WalletConnect initialization error:", err);
        throw new Error("Failed to initialize wallet connection");
      }

      const accounts = await provider.request({ method: 'eth_accounts' });
      console.log("Accounts received:", accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      return accounts[0];
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    connectWallet,
    loading
  };
};
