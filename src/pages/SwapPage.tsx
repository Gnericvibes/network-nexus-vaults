import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useWallet } from '@/contexts/WalletContext';
import { useChain } from '@/contexts/ChainContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowLeft, ArrowDownUp, DollarSign, Exchange, ArrowRight } from 'lucide-react';

const SwapPage: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<{ symbol: string; balance: string }[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { balances, swapToUSDC } = useWallet();
  const { currentChain } = useChain();
  const { addTransaction } = useTransactions();

  useEffect(() => {
    // Build list of available tokens based on balances
    const tokens = [
      { symbol: 'ETH', balance: balances.eth }
    ];
    
    // Add other tokens if they exist
    if (balances.otherTokens && balances.otherTokens.length > 0) {
      balances.otherTokens.forEach(token => {
        tokens.push({ symbol: token.symbol, balance: token.balance });
      });
    }
    
    setAvailableTokens(tokens);
  }, [balances]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      calculateToAmount(value, fromToken);
    }
  };

  const handleTokenChange = (value: string) => {
    setFromToken(value);
    calculateToAmount(fromAmount, value);
  };

  const calculateToAmount = (amount: string, token: string) => {
    if (!amount) {
      setToAmount('');
      return;
    }

    const amountNum = parseFloat(amount);
    
    // Apply exchange rates based on token
    let rate = 1; // Default rate
    if (token === 'ETH') {
      rate = 2500; // Example: 1 ETH = $2500 USDC
    } else {
      // For other tokens like stablecoins, use 1:1 for simplicity
      // In a real app, you would fetch current rates from an API
      const tokenInfo = balances.otherTokens.find(t => t.symbol === token);
      if (tokenInfo) {
        rate = tokenInfo.usdValue / parseFloat(tokenInfo.balance);
      }
    }
    
    const calculatedAmount = (amountNum * rate).toFixed(2);
    setToAmount(calculatedAmount);
  };

  const getMaxBalance = () => {
    if (fromToken === 'ETH') {
      return balances.eth;
    } else {
      const tokenInfo = balances.otherTokens.find(t => t.symbol === fromToken);
      return tokenInfo ? tokenInfo.balance : '0.00';
    }
  };

  const handleMaxAmount = () => {
    const maxBalance = getMaxBalance();
    setFromAmount(maxBalance);
    calculateToAmount(maxBalance, fromToken);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to swap',
        variant: 'destructive',
      });
      return;
    }
    
    const maxBalance = getMaxBalance();
    if (parseFloat(fromAmount) > parseFloat(maxBalance)) {
      toast({
        title: 'Insufficient Balance',
        description: `You don't have enough ${fromToken} for this swap`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await swapToUSDC(fromToken, fromAmount);
      
      if (success) {
        toast({
          title: 'Swap Successful',
          description: `Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} USDC`,
        });
        
        addTransaction({
          type: 'swap', // Now this is a valid TransactionType
          amount: fromAmount,
          status: 'completed',
          chain: currentChain,
          description: `Swapped ${fromAmount} ${fromToken} to ${toAmount} USDC`
        });
        
        // Reset form
        setFromAmount('');
        setToAmount('');
        
        // Optionally redirect to staking page
        navigate('/stake');
      } else {
        throw new Error('Swap failed');
      }
    } catch (error) {
      toast({
        title: 'Swap Failed',
        description: 'There was an error processing your swap',
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
            <h1 className="text-3xl font-bold gradient-text">Swap to USDC</h1>
            <p className="text-muted-foreground mt-1">
              Convert your tokens to USDC for staking
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Swap Tokens</CardTitle>
                <CardDescription>
                  Exchange your crypto assets for USDC to use in savings plans
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSwap} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <Select 
                            value={fromToken}
                            onValueChange={handleTokenChange}
                            disabled={isProcessing || availableTokens.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Token" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTokens.map(token => (
                                <SelectItem 
                                  key={token.symbol} 
                                  value={token.symbol}
                                >
                                  {token.symbol}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2 relative">
                          <Input
                            placeholder="0.00"
                            value={fromAmount}
                            onChange={handleFromAmountChange}
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
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available: {getMaxBalance()} {fromToken}
                      </p>
                    </div>
                    
                    <div className="flex justify-center my-6">
                      <div className="bg-muted rounded-full p-2">
                        <ArrowDownUp className="h-6 w-6 text-app-purple" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>To</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <Select value="USDC" disabled>
                            <SelectTrigger>
                              <SelectValue>USDC</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USDC">USDC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            placeholder="0.00"
                            value={toAmount}
                            disabled
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current Balance: {balances.usdc} USDC
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isProcessing || !fromAmount || parseFloat(fromAmount) <= 0}
                      className="w-full md:w-auto"
                    >
                      {isProcessing ? 'Processing...' : 'Swap & Continue to Stake'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Swap Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-medium">
                      {currentChain === 'ethereum' ? 'Ethereum' : 'Base'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-medium">
                      {fromToken === 'ETH' 
                        ? '1 ETH ≈ 2500 USDC'
                        : `1 ${fromToken} ≈ 1 USDC`}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>You Pay</span>
                    <span className="font-medium">
                      {fromAmount || '0.00'} {fromToken}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>You Receive</span>
                    <span className="font-medium text-app-green">
                      {toAmount || '0.00'} USDC
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/50 flex flex-col items-start gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Exchange className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Swap your existing tokens to USDC for use in our savings programs.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-app-purple flex items-center gap-1 p-0 h-auto"
                    onClick={() => navigate('/stake')}
                  >
                    <span>Skip to Staking</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SwapPage;
