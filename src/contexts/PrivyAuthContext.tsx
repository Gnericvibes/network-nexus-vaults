
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSyncSupabaseProfile } from '@/hooks/useSyncSupabaseProfile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Re-export the PrivyConfigProvider to maintain the same import structure
export { PrivyConfigProvider } from './PrivyConfigProvider';

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
  const { login, logout: privyLogout, authenticated, user, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with Supabase profile
  const { isSyncing, isComplete } = useSyncSupabaseProfile(authenticated, user);

  // Initialize Supabase session using wallet login instead of email or anonymous login
  useEffect(() => {
    const initializeSupabaseSession = async () => {
      if (!authenticated || !user) return;
      
      try {
        // Check if we already have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          return;
        }
        
        // If no session exists, try to create one using a wallet-based authentication
        if (!sessionData.session) {
          console.log('No Supabase session found, attempting to authenticate with wallet');
          
          if (user.wallet?.address) {
            // Using SignIn with the wallet address as the unique identifier
            // This doesn't require the disabled email or anonymous methods
            const { error } = await supabase.auth.signInWithPassword({
              email: `${user.wallet.address.toLowerCase()}@wallet.user`,
              password: `${user.wallet.address}-${process.env.VITE_PRIVY_APP_ID || 'privy'}`
            });
            
            // If the user doesn't exist, create them
            if (error && error.message.includes('Invalid login credentials')) {
              const { error: signUpError } = await supabase.auth.signUp({
                email: `${user.wallet.address.toLowerCase()}@wallet.user`,
                password: `${user.wallet.address}-${process.env.VITE_PRIVY_APP_ID || 'privy'}`
              });
              
              if (signUpError) {
                console.error('Error creating wallet-based user:', signUpError);
                toast.error('Authentication Error', {
                  description: 'Failed to initialize your session.'
                });
              } else {
                console.log('Wallet-based user created successfully');
              }
            } else if (error) {
              console.error('Error signing in with wallet:', error);
              toast.error('Authentication Error', {
                description: 'Failed to initialize your session.'
              });
            } else {
              console.log('Wallet-based login successful');
            }
          } else {
            console.warn('No wallet address available to create session');
          }
        } else {
          console.log('Existing Supabase session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    if (authenticated && user) {
      initializeSupabaseSession();
    }
  }, [authenticated, user]);

  // Update loading state when Privy is ready
  useEffect(() => {
    if (ready && !isSyncing && (isComplete || !authenticated)) {
      setIsLoading(false);
    }
  }, [ready, isSyncing, isComplete, authenticated]);

  const logout = async () => {
    try {
      // First sign out from Supabase
      await supabase.auth.signOut();
      
      // Then sign out from Privy
      await privyLogout();
      
      // Only navigate after logout
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const contextValue: PrivyAuthContextType = {
    isAuthenticated: authenticated,
    isLoading: !ready || isLoading || isSyncing,
    user: authenticated && user ? {
      email: user.email?.address || null,
      wallet: user.wallet?.address || null
    } : null,
    login,
    logout
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
