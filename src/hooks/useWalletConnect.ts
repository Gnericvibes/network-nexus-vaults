
import { useState } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useToast } from '@/hooks/use-toast';
import '../polyfills/global.js';

export const useWalletConnect = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Verify polyfills
      console.log("Checking polyfills before WalletConnect initialization:", {
        buffer: !!window.Buffer,
        util: !!window.util,
        utilInherits: typeof window.util.inherits === 'function',
        eventEmitter: !!window.EventEmitter
      });
      
      if (!window.util || typeof window.util.inherits !== 'function') {
        console.error("Required polyfills not loaded properly. Reloading...");
        await import('../polyfills/global.js');
        
        console.log("Polyfills reloaded:", {
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
            1: "https://eth-mainnet.g.alchemy.com/v2/demo",
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
