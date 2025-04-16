
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Simulate loading user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        // In production, this would connect to Privy SDK
        const storedUser = localStorage.getItem('network-untop-user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Mock functions - would be replaced with actual Privy SDK calls
  const login = async (email: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock wallet
      const wallet = await createWallet();
      
      const newUser = {
        email,
        wallet,
        isAuthenticated: true
      };
      
      // Save to localStorage (in production, this would be handled by Privy)
      localStorage.setItem('network-untop-user', JSON.stringify(newUser));
      setUser(newUser);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user data
      localStorage.removeItem('network-untop-user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (): Promise<string> => {
    // In production, this would create a wallet via Privy SDK
    // For now, we'll generate a random Ethereum-like address
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
