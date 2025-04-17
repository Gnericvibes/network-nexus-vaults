
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useChain } from './ChainContext';

interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue: number;
}

interface StakedAmount {
  protocol: 'SwellChain' | 'Base';
  amount: string;
  lockPeriod: number; // in months
  unlockDate: Date;
  rewards: string;
}

interface WalletContextType {
  balances: {
    usdc: string;
    usdcUsdValue: number;
  };
  staked: StakedAmount[];
  totalStaked: string;
  totalRewards: string;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  stake: (amount: string, protocol: 'SwellChain' | 'Base', lockPeriod: number) => Promise<boolean>;
  withdraw: (stakedId: number) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentChain } = useChain();
  const [balances, setBalances] = useState({ usdc: '0', usdcUsdValue: 0 });
  const [staked, setStaked] = useState<StakedAmount[]>([]);
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalRewards, setTotalRewards] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet data when user or chain changes
  useEffect(() => {
    if (user?.isAuthenticated) {
      refreshBalances();
    }
  }, [user, currentChain]);

  // Calculate totals when staked amounts change
  useEffect(() => {
    if (staked.length > 0) {
      const stakedTotal = staked.reduce(
        (total, item) => total + parseFloat(item.amount), 
        0
      ).toFixed(2);
      
      const rewardsTotal = staked.reduce(
        (total, item) => total + parseFloat(item.rewards), 
        0
      ).toFixed(2);
      
      setTotalStaked(stakedTotal);
      setTotalRewards(rewardsTotal);
    } else {
      setTotalStaked('0');
      setTotalRewards('0');
    }
  }, [staked]);

  const refreshBalances = async () => {
    if (!user?.wallet) return;
    
    setIsLoading(true);
    try {
      // Mock API call to fetch balances
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different balances based on chain
      if (currentChain === 'ethereum') {
        // Fetch balances for Ethereum chain
        setBalances({
          usdc: '1000.00',
          usdcUsdValue: 1000.00
        });
        
        // Fetch staked amounts
        setStaked([
          {
            protocol: 'SwellChain',
            amount: '250.00',
            lockPeriod: 3,
            unlockDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
            rewards: '7.50'
          },
          {
            protocol: 'SwellChain',
            amount: '500.00',
            lockPeriod: 6,
            unlockDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
            rewards: '25.00'
          }
        ]);
      } else {
        // Fetch balances for Base chain
        setBalances({
          usdc: '2000.00',
          usdcUsdValue: 2000.00
        });
        
        // Fetch staked amounts
        setStaked([
          {
            protocol: 'Base',
            amount: '750.00',
            lockPeriod: 3,
            unlockDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
            rewards: '15.00'
          },
          {
            protocol: 'Base',
            amount: '1000.00',
            lockPeriod: 12,
            unlockDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Already unlocked
            rewards: '120.00'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stake = async (
    amount: string, 
    protocol: 'SwellChain' | 'Base', 
    lockPeriod: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add the new staked amount to the list
      const newStakedAmount: StakedAmount = {
        protocol,
        amount,
        lockPeriod,
        unlockDate: new Date(Date.now() + lockPeriod * 30 * 24 * 60 * 60 * 1000),
        rewards: (parseFloat(amount) * lockPeriod * 0.01).toFixed(2) // Mock rewards calculation
      };
      
      setStaked(prev => [...prev, newStakedAmount]);
      
      // Update balance
      setBalances(prev => ({
        ...prev,
        usdc: (parseFloat(prev.usdc) - parseFloat(amount)).toFixed(2),
        usdcUsdValue: parseFloat(prev.usdc) - parseFloat(amount)
      }));
      
      return true;
    } catch (error) {
      console.error('Staking failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async (stakedId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock withdrawal transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the staked amount to withdraw
      const stakedAmount = staked[stakedId];
      if (!stakedAmount) return false;
      
      // Update balance
      const totalAmount = parseFloat(stakedAmount.amount) + parseFloat(stakedAmount.rewards);
      setBalances(prev => ({
        ...prev,
        usdc: (parseFloat(prev.usdc) + totalAmount).toFixed(2),
        usdcUsdValue: parseFloat(prev.usdc) + totalAmount
      }));
      
      // Remove the staked amount
      setStaked(prev => prev.filter((_, i) => i !== stakedId));
      
      return true;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      balances,
      staked,
      totalStaked,
      totalRewards,
      isLoading,
      refreshBalances,
      stake,
      withdraw
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
