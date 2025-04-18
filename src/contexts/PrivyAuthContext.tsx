
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePrivy, PrivyProvider } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        try {
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
              toast.error('Failed to create user profile', {
                description: 'There was an issue setting up your account.'
              });
              console.error('Error creating profile:', insertError);
            } else {
              toast.success('Welcome!', {
                description: 'Your account has been created successfully.'
              });
            }
          }
        } catch (error) {
          toast.error('Authentication Error', {
            description: 'There was a problem syncing your account.'
          });
          console.error('Sync error:', error);
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
      toast.success('Logged out successfully');
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
  // Directly use your Privy App ID here instead of using environment variables
  // You'll need to replace 'your-privy-app-id' with your actual Privy App ID
  const PRIVY_APP_ID = 'INSERT_YOUR_ACTUAL_PRIVY_APP_ID_HERE';
  
  console.log('Using Privy App ID:', PRIVY_APP_ID);

  if (!PRIVY_APP_ID || PRIVY_APP_ID === 'INSERT_YOUR_ACTUAL_PRIVY_APP_ID_HERE') {
    console.error('Privy App ID is missing or not correctly set');
    return <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-red-600">Configuration Error</h2>
        <p className="mb-4">
          The Privy App ID is not properly configured. Please replace 'INSERT_YOUR_ACTUAL_PRIVY_APP_ID_HERE' with your actual Privy App ID in the PrivyAuthContext.tsx file.
        </p>
      </div>
    </div>;
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
