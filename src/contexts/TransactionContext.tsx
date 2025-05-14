
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'stake' 
  | 'unstake' 
  | 'on-ramp' 
  | 'off-ramp'
  | 'swap';  // Added 'swap' as a valid transaction type

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  timestamp: Date;
  chain: 'ethereum' | 'base';
  protocol?: 'SwellChain' | 'Base';
  description?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  getFilteredTransactions: (
    types?: TransactionType[], 
    chain?: 'ethereum' | 'base'
  ) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'on-ramp',
      amount: '1000.00',
      status: 'completed',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      chain: 'ethereum',
      description: 'USDC purchase via Coinbase Pay'
    },
    {
      id: '2',
      type: 'stake',
      amount: '500.00',
      status: 'completed',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      chain: 'ethereum',
      protocol: 'SwellChain',
      description: '6-month lock period'
    },
    {
      id: '3',
      type: 'on-ramp',
      amount: '2000.00',
      status: 'completed',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      chain: 'base',
      description: 'USDC purchase via Yellow Card'
    },
    {
      id: '4',
      type: 'stake',
      amount: '1500.00',
      status: 'completed',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      chain: 'base',
      protocol: 'Base',
      description: '12-month lock period'
    },
    {
      id: '5',
      type: 'unstake',
      amount: '500.00',
      status: 'completed',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      chain: 'base',
      protocol: 'Base',
      description: 'Lock period completed'
    },
    {
      id: '6',
      type: 'off-ramp',
      amount: '250.00',
      status: 'pending',
      timestamp: new Date(),
      chain: 'base',
      description: 'Withdrawal via Coinbase Pay'
    }
  ]);

  const addTransaction = (
    transaction: Omit<Transaction, 'id' | 'timestamp'>
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9), // Generate a random ID
      timestamp: new Date()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getFilteredTransactions = (
    types?: TransactionType[], 
    chain?: 'ethereum' | 'base'
  ): Transaction[] => {
    return transactions.filter(tx => {
      const typeMatch = !types || types.includes(tx.type);
      const chainMatch = !chain || tx.chain === chain;
      return typeMatch && chainMatch;
    });
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction,
      getFilteredTransactions
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
