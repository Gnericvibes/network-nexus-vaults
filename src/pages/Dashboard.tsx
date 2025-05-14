import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import StakedItemCard from '@/components/dashboard/StakedItemCard';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useToast } from '@/components/ui/use-toast';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowUp, ArrowDown, RefreshCw, Wallet, StepForward, LineChart, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    balances, 
    staked, 
    totalStaked, 
    totalRewards, 
    isLoading, 
    refreshBalances,
    withdraw
  } = useWallet();
  const { currentChain } = useChain();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();

  useEffect(() => {
    refreshBalances();
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshBalances();
      toast({
        title: 'Balances Refreshed',
        description: 'Your latest balances have been fetched',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'There was an error refreshing your balances',
        variant: 'destructive',
      });
    }
  };

  const handleWithdraw = async (index: number) => {
    const stakedItem = staked[index];
    try {
      const success = await withdraw(index);
      if (success) {
        toast({
          title: 'Withdrawal Successful',
          description: `You have withdrawn $${stakedItem.amount} USDC + $${stakedItem.rewards} rewards`,
        });
        
        addTransaction({
          type: 'unstake',
          amount: stakedItem.amount,
          status: 'completed',
          chain: currentChain,
          protocol: stakedItem.protocol,
          description: `Unlocked ${stakedItem.lockPeriod} month stake`
        });
      }
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: 'There was an error processing your withdrawal',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your savings and view your staking performance
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ChainSwitcher />
          </div>
        </div>
        
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard 
            title="Available USDC"
            amount={balances.usdc}
            subtitle="Available for staking"
            icon={<Wallet className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <BalanceCard 
            title="Total Staked"
            amount={totalStaked}
            subtitle={`Across ${staked.length} active positions`}
            icon={<StepForward className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <BalanceCard 
            title="Total Rewards"
            amount={totalRewards}
            subtitle="Earned from staking"
            icon={<LineChart className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => navigate('/stake')}
            className="flex-1 sm:flex-none"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Save Now
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/withdraw')}
            className="flex-1 sm:flex-none"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/fiat')}
            className="flex-1 sm:flex-none"
          >
            On-Ramp/Off-Ramp
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/swap')}
            className="w-full"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Swap to USDC
          </Button>
        </div>
        
        {/* Staked Positions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Staked Positions</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse-slow rounded-lg"></div>
              ))}
            </div>
          ) : staked.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staked.map((item, index) => (
                <StakedItemCard
                  key={index}
                  amount={item.amount}
                  protocol={item.protocol}
                  rewards={item.rewards}
                  lockPeriod={item.lockPeriod}
                  unlockDate={item.unlockDate}
                  onWithdraw={() => handleWithdraw(index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <p className="text-muted-foreground mb-4">You don't have any active staking positions</p>
              <Button onClick={() => navigate('/stake')}>Start Staking Now</Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
