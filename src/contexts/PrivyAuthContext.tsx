
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

  // Handle redirection after authentication
  useEffect(() => {
    if (authenticated && !isLoading) {
      navigate('/profile');
    }
  }, [authenticated, isLoading, navigate]);

  useEffect(() => {
    const syncWithSupabase = async () => {
      if (authenticated && user) {
        try {
          // Define user email identifier - use wallet address if email not available
          const userIdentifier = user.email?.address || user.wallet?.address;
          
          if (!userIdentifier) {
            console.error('No user identifier available');
            return;
          }

          let profile = null;
          let fetchError = null;

          // Check if profile exists by email or wallet
          if (user.email?.address && user.wallet?.address) {
            // Check for both email and wallet
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .or(`email.eq.${user.email.address},wallet_address.eq.${user.wallet.address}`)
              .maybeSingle();
            
            profile = data;
            fetchError = error;
          } else if (user.email?.address) {
            // Only email is available
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', user.email.address)
              .maybeSingle();
            
            profile = data;
            fetchError = error;
          } else if (user.wallet?.address) {
            // Only wallet is available
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('wallet_address', user.wallet.address)
              .maybeSingle();
            
            profile = data;
            fetchError = error;
          }

          if (!profile && !fetchError) {
            // Create new profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email?.address || null,
                wallet_address: user.wallet?.address || null
              });

            if (insertError) {
              toast.error('Failed to create user profile', {
                description: 'There was an issue setting up your account.'
              });
              console.error('Error creating profile:', insertError);
            } else {
              toast.success('Welcome!', {
                description: 'Your account has been created successfully.'
                // Redirect will happen automatically due to the authenticated state change
              });
            }
          } else if (fetchError) {
            console.error('Error fetching profile:', fetchError);
            toast.error('Authentication Error', {
              description: 'Could not verify your account.'
            });
          } else if (profile) {
            // Profile exists, update it if needed
            const updates: any = {};
            let needsUpdate = false;
            
            // Update email if it's new
            if (user.email?.address && profile.email !== user.email.address) {
              updates.email = user.email.address;
              needsUpdate = true;
            }
            
            // Update wallet address if it's new
            if (user.wallet?.address && profile.wallet_address !== user.wallet.address) {
              updates.wallet_address = user.wallet.address;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id);
                
              if (updateError) {
                console.error('Error updating profile:', updateError);
              }
            }
            
            // Redirect to profile already happens via the useEffect
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
  }, [authenticated, user, navigate]);

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
  const PRIVY_APP_ID = 'cm9lz7gq800d4l80mm0p6xze7';
  
  console.log('Using Privy App ID:', PRIVY_APP_ID);

  if (!PRIVY_APP_ID) {
    console.error('Privy App ID is missing');
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-red-600">Configuration Error</h2>
          <p className="mb-4">
            The Privy App ID is not properly configured. Please add your Privy App ID.
          </p>
        </div>
      </div>
    );
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
