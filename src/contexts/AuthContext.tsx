import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';

interface User {
  email: string | null;
  wallet: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  createWallet: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const privyAuth = usePrivyAuth();

  useEffect(() => {
    // Sync with Privy auth state
    if (privyAuth.user) {
      setUser({
        email: privyAuth.user.email,
        wallet: privyAuth.user.wallet,
        isAuthenticated: privyAuth.isAuthenticated
      });
    } else {
      setUser(null);
    }
    
    setLoading(privyAuth.isLoading);
  }, [privyAuth.user, privyAuth.isAuthenticated, privyAuth.isLoading]);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const supabaseUser = data.session.user;
          
          // Fetch additional profile data if needed
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          setUser({
            email: supabaseUser.email,
            wallet: profileData?.wallet_address,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const supabaseUser = session?.user;
        setUser({
          email: supabaseUser?.email ?? null,
          wallet: null, // You might want to fetch this from profiles
          isAuthenticated: true
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      // Use Privy auth instead, but keep this for backward compatibility
      await privyAuth.login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Use Privy auth instead, but keep this for backward compatibility
      await privyAuth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (): Promise<string> => {
    // In production, this would be handled by wallet provider
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const address = '0x' + Array(40).fill(0).map(() => randomHex()).join('');
    return address;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, createWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
