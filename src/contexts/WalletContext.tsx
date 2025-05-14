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
    eth: string;
    ethUsdValue: number;
    otherTokens: TokenBalance[];
  };
  staked: StakedAmount[];
  totalStaked: string;
  totalRewards: string;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  stake: (amount: string, protocol: 'SwellChain' | 'Base', lockPeriod: number) => Promise<boolean>;
  withdraw: (stakedId: number) => Promise<boolean>;
  swapToUSDC: (fromToken: string, amount: string) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentChain } = useChain();
  const [balances, setBalances] = useState({ 
    usdc: '0.00', 
    usdcUsdValue: 0,
    eth: '0.00',
    ethUsdValue: 0,
    otherTokens: [] as TokenBalance[]
  });
  const [staked, setStaked] = useState<StakedAmount[]>([]);
  const [totalStaked, setTotalStaked] = useState('0.00');
  const [totalRewards, setTotalRewards] = useState('0.00');
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
      setTotalStaked('0.00');
      setTotalRewards('0.00');
    }
  }, [staked]);

  const refreshBalances = async () => {
    if (!user?.wallet) return;
    
    setIsLoading(true);
    try {
      // Mock API call to fetch balances
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing, we'll default to zero balances for now
      // This can be modified later when testnet tokens are available
      setBalances({
        usdc: '0.00',
        usdcUsdValue: 0,
        eth: '0.00',
        ethUsdValue: 0,
        otherTokens: []
      });
      
      // Default to empty staked positions for initial testing
      setStaked([]);
      
      // Uncomment the below code when you want to show mock data for testing UI
      /*
      if (currentChain === 'ethereum') {
        // Fetch balances for Ethereum chain
        setBalances({
          usdc: '1000.00',
          usdcUsdValue: 1000.00,
          eth: '0.5',
          ethUsdValue: 1250.00,
          otherTokens: [
            { symbol: 'LINK', balance: '10.00', usdValue: 125.00 },
            { symbol: 'UNI', balance: '5.00', usdValue: 60.00 }
          ]
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
          usdcUsdValue: 2000.00,
          eth: '0.2',
          ethUsdValue: 500.00,
          otherTokens: [
            { symbol: 'DAI', balance: '500.00', usdValue: 500.00 }
          ]
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
      */
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

  const swapToUSDC = async (fromToken: string, amount: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amountToSwap = parseFloat(amount);
      let usdcReceived = '0.00';
      let usdcUsdValue = 0;
      
      // Simulated swap rates
      if (fromToken === 'ETH') {
        // Assuming 1 ETH = $2500
        usdcReceived = (amountToSwap * 2500).toFixed(2);
        usdcUsdValue = amountToSwap * 2500;
        
        // Update ETH balance
        setBalances(prev => ({
          ...prev,
          eth: (parseFloat(prev.eth) - amountToSwap).toFixed(2),
          ethUsdValue: prev.ethUsdValue - (amountToSwap * 2500),
          usdc: (parseFloat(prev.usdc) + parseFloat(usdcReceived)).toFixed(2),
          usdcUsdValue: prev.usdcUsdValue + parseFloat(usdcReceived)
        }));
      } else {
        // For other tokens, find them in the otherTokens array
        const tokenIndex = balances.otherTokens.findIndex(t => t.symbol === fromToken);
        if (tokenIndex >= 0) {
          const token = balances.otherTokens[tokenIndex];
          usdcReceived = amountToSwap.toFixed(2); // Assuming 1:1 for simplicity
          usdcUsdValue = amountToSwap;
          
          // Update token balance
          const updatedTokens = [...balances.otherTokens];
          updatedTokens[tokenIndex] = {
            ...token,
            balance: (parseFloat(token.balance) - amountToSwap).toFixed(2),
            usdValue: token.usdValue - amountToSwap
          };
          
          setBalances(prev => ({
            ...prev,
            otherTokens: updatedTokens,
            usdc: (parseFloat(prev.usdc) + parseFloat(usdcReceived)).toFixed(2),
            usdcUsdValue: prev.usdcUsdValue + parseFloat(usdcReceived)
          }));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Swap failed:', error);
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
      withdraw,
      swapToUSDC
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
