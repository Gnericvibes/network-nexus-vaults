
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowLeft, Lock, Unlock, Clock, ExternalLink } from 'lucide-react';

const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { staked, withdraw, isLoading } = useWallet();
  const { currentChain } = useChain();
  const { addTransaction } = useTransactions();

  // Filter staked items by current chain
  const currentChainStaked = staked.filter(item => {
    return (currentChain === 'ethereum' && item.protocol === 'SwellChain') ||
           (currentChain === 'base' && item.protocol === 'Base');
  });

  // Separate staked items by lock status
  const unlockedItems = currentChainStaked.filter(item => new Date() >= item.unlockDate);
  const lockedItems = currentChainStaked.filter(item => new Date() < item.unlockDate);

  const handleWithdraw = async (index: number) => {
    const stakedIndex = staked.findIndex(item => item === currentChainStaked[index]);
    
    if (stakedIndex === -1) {
      toast({
        title: 'Error',
        description: 'Could not find staking position',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await withdraw(stakedIndex);
      
      if (success) {
        toast({
          title: 'Withdrawal Successful',
          description: `You have withdrawn $${currentChainStaked[index].amount} USDC + $${currentChainStaked[index].rewards} rewards`,
        });
        
        addTransaction({
          type: 'unstake',
          amount: currentChainStaked[index].amount,
          status: 'completed',
          chain: currentChain,
          protocol: currentChainStaked[index].protocol,
          description: `Unlocked ${currentChainStaked[index].lockPeriod} month stake`
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

  // Calculate remaining time
  const getRemainingTime = (unlockDate: Date) => {
    const now = new Date();
    const diff = unlockDate.getTime() - now.getTime();
    
    // Convert to days
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Withdraw</h1>
            <p className="text-muted-foreground mt-1">
              Withdraw your staked USDC after the lock period ends
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        {/* Withdrawable Positions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Unlock className="h-5 w-5 text-app-green" />
            Ready to Withdraw
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse-slow rounded-lg"></div>
              ))}
            </div>
          ) : unlockedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedItems.map((item, index) => {
                const totalAmount = parseFloat(item.amount) + parseFloat(item.rewards);
                
                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-2 w-full bg-app-green" />
                    <CardContent className="pt-6">
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.protocol}
                        </span>
                        <div className="flex items-center text-app-green">
                          <Unlock size={16} className="mr-1" />
                          Unlocked
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold">${item.amount}</div>
                          <p className="text-xs text-muted-foreground">Principal</p>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-app-green">+${item.rewards}</div>
                          <p className="text-xs text-muted-foreground">Rewards</p>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="text-xl font-bold">${totalAmount.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Total Withdrawable</p>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full mt-4"
                        onClick={() => handleWithdraw(currentChainStaked.indexOf(item))}
                      >
                        Withdraw Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-muted-foreground">
                  You don't have any positions ready to withdraw on {currentChain === 'ethereum' ? 'Ethereum' : 'Base'}.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/fiat')}
                >
                  Off-Ramp USDC Instead
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Locked Positions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-app-gray" />
            Still Locked
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse-slow rounded-lg"></div>
              ))}
            </div>
          ) : lockedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedItems.map((item, index) => {
                const totalAmount = parseFloat(item.amount) + parseFloat(item.rewards);
                
                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-2 w-full bg-app-gray" />
                    <CardContent className="pt-6">
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.protocol}
                        </span>
                        <div className="flex items-center text-app-gray">
                          <Lock size={16} className="mr-1" />
                          {item.lockPeriod} Month Lock
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold">${item.amount}</div>
                          <p className="text-xs text-muted-foreground">Principal</p>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-app-green">+${item.rewards}</div>
                          <p className="text-xs text-muted-foreground">Est. Rewards</p>
                        </div>
                        
                        <div className="flex items-center text-sm text-app-gray mt-2">
                          <Clock size={14} className="mr-1" />
                          {getRemainingTime(item.unlockDate)}
                        </div>
                        
                        <div className="pt-2 mt-1 border-t">
                          <div className="text-xl font-bold">${totalAmount.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Total at Unlock</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        disabled
                      >
                        Locked
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-muted-foreground">
                  You don't have any locked positions on {currentChain === 'ethereum' ? 'Ethereum' : 'Base'}.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/stake')}
                >
                  Start Staking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Information Card */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Off-Ramp to Fiat</CardTitle>
            <CardDescription>
              Need to convert your USDC to fiat currency?
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              You can off-ramp your USDC to your local currency through our partners.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/fiat')}
            >
              Go to On-Ramp/Off-Ramp <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default WithdrawPage;
