
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface AuthWalletContextType {
  user: {
    email: string | null;
    wallet: string | null;
    isAuthenticated: boolean;
  } | null;
  loading: boolean;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthWalletContext = createContext<AuthWalletContextType | undefined>(undefined);

export const AuthWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthWalletContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            email: session.user.email,
            wallet: profile?.wallet_address || null,
            isAuthenticated: true
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              email: session.user.email,
              wallet: profile?.wallet_address || null,
              isAuthenticated: true
            });
          });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We sent you a login link. Be sure to check your spam folder.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  };

  const loginWithWallet = async () => {
    try {
      setLoading(true);
      
      // Check that polyfills are loaded
      if (!window.util || !window.util.inherits || !window.Buffer) {
        console.error("Required polyfills not loaded. Attempting to reload...");
        // Force reload of polyfills
        await import('../polyfills/global.js');
      }
      
      // Create WalletConnect Provider with a fallback mechanism
      let provider;
      try {
        // Add console logs to track initialization
        console.log("Initializing WalletConnect provider...");
        
        provider = new WalletConnectProvider({
          rpc: {
            1: "https://eth-mainnet.g.alchemy.com/v2/demo", // Use publicly available endpoint
            137: "https://polygon-rpc.com", // Public Polygon endpoint
            8453: "https://mainnet.base.org", // Base
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
        toast({
          title: "Wallet Connection Error",
          description: "Failed to initialize wallet connection. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get account
      console.log("Requesting accounts...");
      const accounts = await provider.request({ method: 'eth_accounts' });
      console.log("Accounts received:", accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please check your wallet connection.");
      }
      
      const walletAddress = accounts[0];
      console.log("Using wallet address:", walletAddress);

      // Create a random password for the user
      const password = crypto.randomUUID();
      
      // Check if a user with this wallet exists
      const { data: existingWalletUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingWalletUser) {
        // User exists, get their email
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', existingWalletUser.id)
          .single();
          
        if (userData?.email) {
          // Sign in
          const { error } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: password,
          });
          
          if (error) throw error;
        }
      } else {
        // Create new user
        const email = `wallet_${walletAddress.substring(2, 8)}@untopnetwork.com`;
        
        const { error, data } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        
        if (error) throw error;
        
        // Update profile with wallet address
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ wallet_address: walletAddress })
            .eq('id', data.user.id);
        }
      }

      toast({
        title: "Wallet Connected",
        description: `Connected with wallet ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Wallet login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthWalletContext.Provider value={{
      user,
      loading,
      loginWithEmail,
      loginWithWallet,
      logout
    }}>
      {children}
    </AuthWalletContext.Provider>
  );
};

export const useAuthWallet = () => {
  const context = useContext(AuthWalletContext);
  if (context === undefined) {
    throw new Error('useAuthWallet must be used within an AuthWalletProvider');
  }
  return context;
};
