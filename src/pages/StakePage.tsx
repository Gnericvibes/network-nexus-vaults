
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowLeft, InfoIcon, Clock } from 'lucide-react';

const StakePage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balances, stake } = useWallet();
  const { currentChain } = useChain();
  const { addTransaction } = useTransactions();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balances.usdc);
  };

  const calculateRewards = () => {
    if (!amount) return '0.00';
    
    // Simple rewards calculation based on lock period
    // In a real app, this would call an API or smart contract
    const principal = parseFloat(amount);
    const months = parseInt(lockPeriod);
    
    // Different APRs based on protocol and lock period
    let apr = 0;
    if (currentChain === 'ethereum') {
      // SwellChain APRs
      if (months === 3) apr = 0.03; // 3% APR
      else if (months === 6) apr = 0.05; // 5% APR
      else if (months === 12) apr = 0.08; // 8% APR
    } else {
      // Base APRs
      if (months === 3) apr = 0.04; // 4% APR
      else if (months === 6) apr = 0.06; // 6% APR
      else if (months === 12) apr = 0.10; // 10% APR
    }
    
    // Calculate rewards for the lock period
    const rewards = principal * apr * (months / 12);
    return rewards.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to stake',
        variant: 'destructive',
      });
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balances.usdc)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough USDC to stake this amount',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const protocol = currentChain === 'ethereum' ? 'SwellChain' : 'Base';
      const success = await stake(amount, protocol, parseInt(lockPeriod));
      
      if (success) {
        toast({
          title: 'Staking Successful',
          description: `You have successfully staked $${amount} USDC for ${lockPeriod} months`,
        });
        
        addTransaction({
          type: 'stake',
          amount,
          status: 'completed',
          chain: currentChain,
          protocol,
          description: `${lockPeriod}-month lock period`
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Staking Failed',
        description: 'There was an error processing your staking request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-3xl font-bold gradient-text">Stake USDC</h1>
            <p className="text-muted-foreground mt-1">
              Earn rewards by staking your USDC for a fixed period
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Stake USDC</CardTitle>
                <CardDescription>
                  Choose your staking amount and lock period to start earning rewards
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount (USDC)
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        placeholder="0.00"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-2 top-0 h-full px-2 text-sm font-medium text-app-purple"
                        onClick={handleMaxAmount}
                      >
                        MAX
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available: ${balances.usdc} USDC
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>
                      Lock Period
                    </Label>
                    <RadioGroup value={lockPeriod} onValueChange={setLockPeriod} className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="3months"
                        className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                          lockPeriod === '3' ? 'border-primary' : 'border-input'
                        }`}
                      >
                        <RadioGroupItem value="3" id="3months" className="sr-only" />
                        <Clock className="h-5 w-5 mb-2" />
                        <span className="text-lg font-medium">3 Months</span>
                      </Label>
                      <Label
                        htmlFor="6months"
                        className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                          lockPeriod === '6' ? 'border-primary' : 'border-input'
                        }`}
                      >
                        <RadioGroupItem value="6" id="6months" className="sr-only" />
                        <Clock className="h-5 w-5 mb-2" />
                        <span className="text-lg font-medium">6 Months</span>
                      </Label>
                      <Label
                        htmlFor="12months"
                        className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                          lockPeriod === '12' ? 'border-primary' : 'border-input'
                        }`}
                      >
                        <RadioGroupItem value="12" id="12months" className="sr-only" />
                        <Clock className="h-5 w-5 mb-2" />
                        <span className="text-lg font-medium">12 Months</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? 'Processing...' : 'Stake Now'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Protocol</span>
                    <span className="font-medium">
                      {currentChain === 'ethereum' ? 'SwellChain' : 'Base'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chain</span>
                    <span className="font-medium">
                      {currentChain === 'ethereum' ? 'Ethereum' : 'Base'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lock Period</span>
                    <span className="font-medium">
                      {lockPeriod} Months
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="font-medium">
                      ${amount || '0.00'} USDC
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Estimated Rewards</span>
                    <span className="font-medium text-app-green">
                      +${calculateRewards()} USDC
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Total at Unlock</span>
                    <span className="font-bold">
                      ${amount ? (parseFloat(amount) + parseFloat(calculateRewards())).toFixed(2) : '0.00'} USDC
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/50 flex items-start gap-2 text-sm">
                <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Staked USDC cannot be withdrawn until the lock period ends. Rewards are estimated and may vary based on protocol performance.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StakePage;
