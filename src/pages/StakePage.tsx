
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowLeft, InfoIcon, Clock, Target } from 'lucide-react';

// Custom duration options
const DURATION_TYPES = {
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months'
};

// Predefined goals for users to choose from
const PREDEFINED_GOALS = [
  'Rent Payment',
  'School Fees',
  'Medical Expenses',
  'Business Capital',
  'Travel Fund',
  'Emergency Fund',
  'Custom Goal'
];

const StakePage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('3');
  const [durationType, setDurationType] = useState(DURATION_TYPES.MONTHS);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [selectedPredefinedGoal, setSelectedPredefinedGoal] = useState('');
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

  const handlePredefinedGoalChange = (value: string) => {
    setSelectedPredefinedGoal(value);
    if (value !== 'Custom Goal') {
      setGoalName(value);
    } else {
      setGoalName('');
    }
  };

  const handleGoalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalName(e.target.value);
  };

  const handleDurationTypeChange = (value: string) => {
    setDurationType(value);
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Only allow numbers
      setCustomDuration(value);
    }
  };

  const toggleCustomDuration = () => {
    setIsCustomDuration(!isCustomDuration);
    if (!isCustomDuration) {
      setLockPeriod('');
    } else {
      setLockPeriod('3');
      setCustomDuration('');
    }
  };

  // Convert duration to months for calculations
  const getDurationInMonths = (): number => {
    if (isCustomDuration) {
      const duration = parseInt(customDuration || '0');
      switch (durationType) {
        case DURATION_TYPES.HOURS:
          return duration / (24 * 30); // Approximate
        case DURATION_TYPES.DAYS:
          return duration / 30; // Approximate
        case DURATION_TYPES.WEEKS:
          return duration / 4; // Approximate
        case DURATION_TYPES.MONTHS:
          return duration;
        default:
          return 0;
      }
    }
    return parseInt(lockPeriod || '0');
  };

  const calculateRewards = () => {
    if (!amount) return '0.00';
    
    // Simple rewards calculation based on lock period
    // In a real app, this would call an API or smart contract
    const principal = parseFloat(amount);
    const months = getDurationInMonths();
    
    // Different APRs based on protocol and lock period
    let apr = 0;
    if (currentChain === 'ethereum') {
      // SwellChain APRs
      if (months <= 1) apr = 0.02; // 2% APR for short term
      else if (months <= 3) apr = 0.03; // 3% APR
      else if (months <= 6) apr = 0.05; // 5% APR
      else apr = 0.08; // 8% APR
    } else {
      // Base APRs
      if (months <= 1) apr = 0.03; // 3% APR for short term
      else if (months <= 3) apr = 0.04; // 4% APR
      else if (months <= 6) apr = 0.06; // 6% APR
      else apr = 0.10; // 10% APR
    }
    
    // Calculate rewards for the lock period
    const rewards = principal * apr * (months / 12);
    return rewards.toFixed(2);
  };

  // Get display text for duration
  const getDurationDisplay = (): string => {
    if (isCustomDuration && customDuration) {
      const duration = parseInt(customDuration);
      return `${duration} ${durationType}`;
    }
    return `${lockPeriod} ${parseInt(lockPeriod) === 1 ? 'Month' : 'Months'}`;
  };

  // Get unlock date based on duration
  const getUnlockDate = (): Date => {
    const now = new Date();
    
    if (isCustomDuration && customDuration) {
      const duration = parseInt(customDuration);
      switch (durationType) {
        case DURATION_TYPES.HOURS:
          return new Date(now.getTime() + duration * 60 * 60 * 1000);
        case DURATION_TYPES.DAYS:
          return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        case DURATION_TYPES.WEEKS:
          return new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
        case DURATION_TYPES.MONTHS:
          const newDate = new Date(now);
          newDate.setMonth(now.getMonth() + duration);
          return newDate;
        default:
          return now;
      }
    }
    
    // Default case: months
    const newDate = new Date(now);
    newDate.setMonth(now.getMonth() + parseInt(lockPeriod));
    return newDate;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

    if (isCustomDuration && (!customDuration || parseInt(customDuration) <= 0)) {
      toast({
        title: 'Invalid Duration',
        description: 'Please enter a valid duration',
        variant: 'destructive',
      });
      return;
    }

    if (!goalName.trim()) {
      toast({
        title: 'Missing Goal Name',
        description: 'Please enter a name for your savings goal',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const protocol = currentChain === 'ethereum' ? 'SwellChain' : 'Base';
      const months = getDurationInMonths();
      const duration = isCustomDuration 
        ? `${customDuration} ${durationType}`
        : `${lockPeriod} months`;
        
      const success = await stake(amount, protocol, months);
      
      if (success) {
        toast({
          title: 'Staking Successful',
          description: `You have successfully staked $${amount} USDC for your "${goalName}" goal`,
        });
        
        addTransaction({
          type: 'stake',
          amount,
          status: 'completed',
          chain: currentChain,
          protocol,
          description: `${duration} lock period - ${goalName}`
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
            <h1 className="text-3xl font-bold gradient-text">Create Savings Goal</h1>
            <p className="text-muted-foreground mt-1">
              Set your savings goal, amount, and lock period
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Savings Goal</CardTitle>
                <CardDescription>
                  Choose your goal, staking amount and lock period to start earning rewards
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="goal">
                      Savings Goal
                    </Label>
                    <Select
                      value={selectedPredefinedGoal}
                      onValueChange={handlePredefinedGoalChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a savings goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_GOALS.map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedPredefinedGoal === 'Custom Goal' && (
                      <div className="pt-2">
                        <Label htmlFor="customGoal">
                          Custom Goal Name
                        </Label>
                        <Input
                          id="customGoal"
                          placeholder="e.g., New Laptop Fund"
                          value={goalName}
                          onChange={handleGoalNameChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  </div>

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
                    <div className="flex justify-between items-center">
                      <Label>
                        Lock Period
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={toggleCustomDuration}
                      >
                        {isCustomDuration ? 'Use Preset Durations' : 'Use Custom Duration'}
                      </Button>
                    </div>
                    
                    {isCustomDuration ? (
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Input
                            placeholder="Duration"
                            value={customDuration}
                            onChange={handleCustomDurationChange}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="w-1/3">
                          <Select
                            value={durationType}
                            onValueChange={handleDurationTypeChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={DURATION_TYPES.HOURS}>Hours</SelectItem>
                              <SelectItem value={DURATION_TYPES.DAYS}>Days</SelectItem>
                              <SelectItem value={DURATION_TYPES.WEEKS}>Weeks</SelectItem>
                              <SelectItem value={DURATION_TYPES.MONTHS}>Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || !goalName}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? 'Processing...' : 'Create Savings Goal'}
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
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {goalName || "Not set"}
                    </span>
                  </div>
                
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
                      {(isCustomDuration && customDuration) || lockPeriod ? getDurationDisplay() : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unlock Date</span>
                    <span className="font-medium">
                      {(isCustomDuration && customDuration) || lockPeriod ? formatDate(getUnlockDate()) : 'Not set'}
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
                  Staked USDC cannot be withdrawn until the lock period ends. Early withdrawal incurs a 5% penalty fee. Rewards are estimated and may vary based on protocol performance.
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
