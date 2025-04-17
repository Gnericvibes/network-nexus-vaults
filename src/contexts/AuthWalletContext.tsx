
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthUser, AuthWalletContextType } from './types';

const AuthWalletContext = createContext<AuthWalletContextType | undefined>(undefined);

export const AuthWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: privyUser, login, logout } = usePrivy();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (privyUser) {
        const walletAddress = privyUser.wallet?.address || '';
        const email = privyUser.email?.address || '';
        
        try {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

          if (!existingUser) {
            // Create a new profile if not exists
            await supabase.from('profiles').insert({
              wallet_address: walletAddress,
              email: email
            });
          }

          setUser({
            email: email,
            wallet: walletAddress,
            isAuthenticated: true
          });

          navigate('/dashboard');
        } catch (error) {
          console.error('User sync error:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    handleAuthChange();
  }, [privyUser, navigate]);

  const loginWithWallet = async () => {
    try {
      await login();
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Unable to connect wallet',
        variant: 'destructive'
      });
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      await supabase.auth.signOut();
      setUser(null);
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Unable to log out',
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthWalletContext.Provider value={{
      user,
      loading,
      loginWithEmail: () => Promise.reject('Email login not supported with Privy'),
      loginWithWallet,
      logout: logoutUser
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
