
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

  // Update loading state when Privy is ready
  useEffect(() => {
    if (ready && !isSyncing && (isComplete || !authenticated)) {
      setIsLoading(false);
    }
  }, [ready, isSyncing, isComplete, authenticated]);

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Privy first
      await privyLogout();
      console.log('Privy logout completed');
      
      // Then sign out from Supabase if there's a session
      try {
        await supabase.auth.signOut();
        console.log('Supabase signout completed');
      } catch (supabaseError) {
        console.log('Supabase signout not needed or failed:', supabaseError);
      }
      
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
