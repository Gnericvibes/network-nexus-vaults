
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
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", // You should use an env variable for this
        },
      });

      await provider.enable();
      const accounts = await provider.request({ method: 'eth_accounts' });
      const walletAddress = accounts[0];

      // Create or update user profile with wallet address
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (!existingUser) {
        // Create new user with wallet
        const { error } = await supabase.auth.signUp({
          email: `${walletAddress}@wallet.user`,
          password: crypto.randomUUID(),
        });

        if (error) throw error;
      } else {
        // Login existing user
        setUser({
          email: existingUser.email,
          wallet: walletAddress,
          isAuthenticated: true
        });
      }

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
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
