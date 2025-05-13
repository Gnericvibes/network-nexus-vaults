
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSyncSupabaseProfile } from '@/hooks/useSyncSupabaseProfile';
import { toast } from 'sonner';

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
  const { login, logout, authenticated, user, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with Supabase profile
  const { isSyncing } = useSyncSupabaseProfile(authenticated, user);

  // Update loading state when Privy is ready
  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  // Handle redirection after authentication - but prevent loops
  useEffect(() => {
    if (authenticated && !isLoading && !isSyncing) {
      // Only redirect to dashboard if we're on the auth or root page
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/dashboard');
      }
    } else if (!authenticated && !isLoading && location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/landing') {
      // If not authenticated and not on public pages, redirect to auth
      navigate('/auth');
    }
  }, [authenticated, isLoading, isSyncing, navigate, location.pathname]);

  const contextValue: PrivyAuthContextType = {
    isAuthenticated: authenticated,
    isLoading: !ready || isLoading || isSyncing,
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
