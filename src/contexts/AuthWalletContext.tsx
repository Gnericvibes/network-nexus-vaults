
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { AuthWalletContextType, AuthUser } from './types';

const AuthWalletContext = createContext<AuthWalletContextType | undefined>(undefined);

export const AuthWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { connectWallet, loading: walletLoading } = useWalletConnect();

  const loginWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We sent you a login link. Be sure to check your spam folder.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  };

  const loginWithWallet = async () => {
    try {
      const walletAddress = await connectWallet();
      const password = crypto.randomUUID();
      
      const { data: existingWalletUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingWalletUser) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', existingWalletUser.id)
          .single();
          
        if (userData?.email) {
          const { error } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: password,
          });
          
          if (error) throw error;
        }
      } else {
        const email = `wallet_${walletAddress.substring(2, 8)}@untopnetwork.com`;
        
        const { error, data } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ wallet_address: walletAddress })
            .eq('id', data.user.id);
        }
      }

      toast({
        title: "Wallet Connected",
        description: `Connected with wallet ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Wallet login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthWalletContext.Provider value={{
      user,
      loading: loading || walletLoading,
      loginWithEmail,
      loginWithWallet,
      logout
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
