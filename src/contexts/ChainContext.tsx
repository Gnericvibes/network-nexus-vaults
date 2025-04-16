
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ChainType = 'ethereum' | 'base';

interface ChainContextType {
  currentChain: ChainType;
  switchChain: (chain: ChainType) => Promise<void>;
  isSwellChainAvailable: boolean;
  isBaseAvailable: boolean;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChain, setCurrentChain] = useState<ChainType>('ethereum');
  const [isSwellChainAvailable, setIsSwellChainAvailable] = useState(true);
  const [isBaseAvailable, setIsBaseAvailable] = useState(true);

  useEffect(() => {
    // Check for saved chain preference
    const savedChain = localStorage.getItem('network-untop-chain');
    if (savedChain && (savedChain === 'ethereum' || savedChain === 'base')) {
      setCurrentChain(savedChain);
    }
    
    // In a real app, you would check for actual chain availability
    checkChainAvailability();
  }, []);

  const checkChainAvailability = async () => {
    // Mock function - in production would check actual chain availability
    // For example, check if the user's wallet supports these chains
    setIsSwellChainAvailable(true);
    setIsBaseAvailable(true);
  };

  const switchChain = async (chain: ChainType) => {
    try {
      // Simulate chain switching delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, this would interact with the wallet to switch chains
      setCurrentChain(chain);
      localStorage.setItem('network-untop-chain', chain);
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  };

  return (
    <ChainContext.Provider value={{ 
      currentChain, 
      switchChain,
      isSwellChainAvailable,
      isBaseAvailable
    }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};
