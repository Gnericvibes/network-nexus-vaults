
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowLeft, DollarSign, Banknote, ArrowDownUp, CreditCard } from 'lucide-react';

const FiatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('on-ramp');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('coinbase');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [currency, setCurrency] = useState('usd');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balances, refreshBalances } = useWallet();
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
    if (activeTab === 'off-ramp') {
      setAmount(balances.usdc);
    }
  };

  const handleOnRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful deposit
      toast({
        title: 'Deposit Initiated',
        description: `Your deposit of $${amount} is being processed`,
      });
      
      addTransaction({
        type: 'on-ramp',
        amount,
        status: 'pending',
        chain: currentChain,
        description: `USDC purchase via ${provider === 'yellowcard' ? 'Yellow Card' : 'Coinbase Pay'}`
      });
      
      // Simulate balance update
      setTimeout(async () => {
        await refreshBalances();
        
        addTransaction({
          type: 'on-ramp',
          amount,
          status: 'completed',
          chain: currentChain,
          description: `USDC purchase via ${provider === 'yellowcard' ? 'Yellow Card' : 'Coinbase Pay'}`
        });
        
        toast({
          title: 'Deposit Successful',
          description: `$${amount} USDC has been added to your wallet`,
        });
      }, 3000);
      
      // Reset form
      setAmount('');
      
    } catch (error) {
      toast({
        title: 'Deposit Failed',
        description: 'There was an error processing your deposit',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOffRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balances.usdc)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough USDC for this withdrawal',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful withdrawal
      toast({
        title: 'Withdrawal Initiated',
        description: `Your withdrawal of $${amount} is being processed`,
      });
      
      addTransaction({
        type: 'off-ramp',
        amount,
        status: 'pending',
        chain: currentChain,
        description: `Withdrawal via ${provider === 'yellowcard' ? 'Yellow Card' : 'Coinbase Pay'}`
      });
      
      // Reset form
      setAmount('');
      
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: 'There was an error processing your withdrawal',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
            <h1 className="text-3xl font-bold gradient-text">On-Ramp/Off-Ramp</h1>
            <p className="text-muted-foreground mt-1">
              Convert between fiat currency and USDC
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="on-ramp" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="on-ramp" className="text-base">
                  <DollarSign className="h-4 w-4 mr-2" />
                  On-Ramp (Buy USDC)
                </TabsTrigger>
                <TabsTrigger value="off-ramp" className="text-base">
                  <Banknote className="h-4 w-4 mr-2" />
                  Off-Ramp (Sell USDC)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="on-ramp">
                <Card>
                  <CardHeader>
                    <CardTitle>Buy USDC with Fiat</CardTitle>
                    <CardDescription>
                      Purchase USDC using your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleOnRamp} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="on-ramp-amount">
                          Amount
                        </Label>
                        <div className="relative">
                          <Input
                            id="on-ramp-amount"
                            placeholder="0.00"
                            value={amount}
                            onChange={handleAmountChange}
                            disabled={isProcessing}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <Select 
                              value={currency}
                              onValueChange={setCurrency}
                              disabled={isProcessing}
                            >
                              <SelectTrigger className="w-20 border-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD</SelectItem>
                                <SelectItem value="eur">EUR</SelectItem>
                                <SelectItem value="gbp">GBP</SelectItem>
                                <SelectItem value="ngn">NGN</SelectItem>
                                <SelectItem value="zar">ZAR</SelectItem>
                                <SelectItem value="ksh">KSH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>
                          Provider
                        </Label>
                        <RadioGroup 
                          value={provider} 
                          onValueChange={setProvider} 
                          className="grid grid-cols-2 gap-4"
                          disabled={isProcessing}
                        >
                          <Label
                            htmlFor="coinbase"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              provider === 'coinbase' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="coinbase" id="coinbase" className="sr-only" />
                            <div className="text-xl font-bold mb-2 text-app-blue">Coinbase Pay</div>
                            <span className="text-sm text-center text-muted-foreground">Global Coverage</span>
                          </Label>
                          <Label
                            htmlFor="yellowcard"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              provider === 'yellowcard' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="yellowcard" id="yellowcard" className="sr-only" />
                            <div className="text-xl font-bold mb-2 text-app-green">Yellow Card</div>
                            <span className="text-sm text-center text-muted-foreground">Africa-based Users</span>
                          </Label>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>
                          Payment Method
                        </Label>
                        <RadioGroup 
                          value={paymentMethod} 
                          onValueChange={setPaymentMethod} 
                          className="grid grid-cols-2 gap-4"
                          disabled={isProcessing}
                        >
                          <Label
                            htmlFor="bank"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              paymentMethod === 'bank' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="bank" id="bank" className="sr-only" />
                            <div className="font-medium mb-1">Bank Transfer</div>
                            <span className="text-sm text-center text-muted-foreground">Slower but cheaper</span>
                          </Label>
                          <Label
                            htmlFor="card"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              paymentMethod === 'card' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="card" id="card" className="sr-only" />
                            <div className="font-medium mb-1">Card Payment</div>
                            <span className="text-sm text-center text-muted-foreground">Instant but fees apply</span>
                          </Label>
                        </RadioGroup>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                          className="w-full md:w-auto"
                        >
                          {isProcessing ? 'Processing...' : 'Buy USDC'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="off-ramp">
                <Card>
                  <CardHeader>
                    <CardTitle>Sell USDC for Fiat</CardTitle>
                    <CardDescription>
                      Convert USDC to fiat and withdraw to your bank account
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleOffRamp} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="off-ramp-amount">
                          Amount (USDC)
                        </Label>
                        <div className="relative">
                          <Input
                            id="off-ramp-amount"
                            placeholder="0.00"
                            value={amount}
                            onChange={handleAmountChange}
                            disabled={isProcessing}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-2 top-0 h-full px-2 text-sm font-medium text-app-purple"
                            onClick={handleMaxAmount}
                            disabled={isProcessing}
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
                          Provider
                        </Label>
                        <RadioGroup 
                          value={provider} 
                          onValueChange={setProvider} 
                          className="grid grid-cols-2 gap-4"
                          disabled={isProcessing}
                        >
                          <Label
                            htmlFor="coinbase-off"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              provider === 'coinbase' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="coinbase" id="coinbase-off" className="sr-only" />
                            <div className="text-xl font-bold mb-2 text-app-blue">Coinbase Pay</div>
                            <span className="text-sm text-center text-muted-foreground">Global Coverage</span>
                          </Label>
                          <Label
                            htmlFor="yellowcard-off"
                            className={`flex flex-col items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent ${
                              provider === 'yellowcard' ? 'border-primary' : 'border-input'
                            }`}
                          >
                            <RadioGroupItem value="yellowcard" id="yellowcard-off" className="sr-only" />
                            <div className="text-xl font-bold mb-2 text-app-green">Yellow Card</div>
                            <span className="text-sm text-center text-muted-foreground">Africa-based Users</span>
                          </Label>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency-select">
                          Receive Currency
                        </Label>
                        <Select 
                          value={currency}
                          onValueChange={setCurrency}
                          disabled={isProcessing}
                        >
                          <SelectTrigger id="currency-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD - US Dollar</SelectItem>
                            <SelectItem value="eur">EUR - Euro</SelectItem>
                            <SelectItem value="gbp">GBP - British Pound</SelectItem>
                            <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                            <SelectItem value="zar">ZAR - South African Rand</SelectItem>
                            <SelectItem value="ksh">KSH - Kenyan Shilling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balances.usdc)}
                          className="w-full md:w-auto"
                        >
                          {isProcessing ? 'Processing...' : 'Sell USDC'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>USDC Balance</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">${balances.usdc}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available USDC
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardContent className="border-t pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Service Information</h3>
                  
                  {activeTab === 'on-ramp' ? (
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start">
                        <ArrowDownUp className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          Buy USDC directly with your local currency through our partner providers.
                        </span>
                      </p>
                      <p className="flex items-start">
                        <CreditCard className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          Bank transfers typically take 1-3 business days, while card payments are instant.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start">
                        <ArrowDownUp className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          Convert your USDC back to your local currency and withdraw to your bank account.
                        </span>
                      </p>
                      <p className="flex items-start">
                        <CreditCard className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          Withdrawals typically take 1-2 business days to reach your bank account.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/50 flex items-start gap-2 text-sm">
                <p>
                  {provider === 'yellowcard' 
                    ? 'Yellow Card is available in select African countries only.'
                    : 'Coinbase Pay is available globally with some exceptions.'}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default FiatPage;
