
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

  // Initialize Supabase session using anonymous authentication
  useEffect(() => {
    const initializeSupabaseSession = async () => {
      if (!authenticated || !user) return;
      
      try {
        console.log('Starting Supabase session initialization...');
        
        // Check if we already have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          return;
        }
        
        // If no session exists, create an anonymous session
        if (!sessionData.session) {
          console.log('No Supabase session found, creating anonymous session');
          
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
          
          if (anonError) {
            console.error('Error creating anonymous session:', anonError);
            toast.error('Authentication Error', {
              description: 'Failed to initialize session. Please try again.'
            });
          } else {
            console.log('Anonymous session created successfully');
          }
        } else {
          console.log('Existing Supabase session found:', sessionData.session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Authentication Error', {
          description: 'Failed to initialize session. Please try again.'
        });
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
      console.log('Starting logout process...');
      
      // First sign out from Supabase
      await supabase.auth.signOut();
      console.log('Supabase signout completed');
      
      // Then sign out from Privy
      await privyLogout();
      console.log('Privy logout completed');
      
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
