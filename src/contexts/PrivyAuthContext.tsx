
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Sync with Supabase profile
  const { isSyncing, isComplete } = useSyncSupabaseProfile(authenticated, user);

  // Initialize Supabase auth with Privy
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authenticated || !user || authInitialized) return;
      
      try {
        // Check if we already have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          return;
        }
        
        // If no session exists, create an anonymous session
        if (!sessionData.session) {
          console.log('No Supabase session found, creating anonymous session...');
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.error('Error creating anonymous session:', error);
            toast.error('Authentication Error', {
              description: 'Failed to initialize your session.'
            });
          } else {
            console.log('Anonymous session created successfully');
            setAuthInitialized(true);
          }
        } else {
          console.log('Existing Supabase session found');
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    initializeAuth();
  }, [authenticated, user, authInitialized]);

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
      
      setAuthInitialized(false);
      
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
