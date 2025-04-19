
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePrivy, PrivyProvider } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PrivyAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    email: string | null;
    wallet: string | null;
  } | null;
  login: () => void;
  logout: () => Promise<void>;
}

const PrivyAuthContext = createContext<PrivyAuthContextType | undefined>(undefined);

export const PrivyAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  // Sync Privy auth state with Supabase
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (authenticated && user) {
        // User is authenticated in Privy, check if they exist in Supabase profiles
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select()
          .eq('email', user.email?.address)
          .maybeSingle();

        if (!profile && !fetchError) {
          // Create profile if doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id, // Using Privy user ID
              email: user.email?.address,
              wallet_address: user.wallet?.address
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
      }
    };

    if (authenticated && user) {
      syncWithSupabase();
    }
  }, [authenticated, user]);

  const contextValue: PrivyAuthContextType = {
    isAuthenticated: authenticated,
    isLoading: !ready || isLoading,
    user: authenticated && user ? {
      email: user.email?.address || null,
      wallet: user.wallet?.address || null
    } : null,
    login,
    logout: async () => {
      await logout();
      navigate('/');
    }
  };

  return (
    <PrivyAuthContext.Provider value={contextValue}>
      {children}
    </PrivyAuthContext.Provider>
  );
};

export const usePrivyAuth = () => {
  const context = useContext(PrivyAuthContext);
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within a PrivyAuthProvider');
  }
  return context;
};

export const PrivyAuthConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
  
  if (!PRIVY_APP_ID) {
    console.error('Missing PRIVY_APP_ID environment variable');
    return <div>Error: Privy configuration is missing.</div>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
