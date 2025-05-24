import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';
import { ArrowLeft, Copy, Wallet, Check, Shield, Key, Lock } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = usePrivyAuth();

  const copyToClipboard = () => {
    if (user?.wallet) {
      navigator.clipboard.writeText(user.wallet);
      setCopied(true);
      
      toast({
        title: 'Copied',
        description: 'Wallet address copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your wallet and account preferences
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="wallet" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
            <TabsTrigger value="wallet">
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Shield className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="fiat">
              <Key className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                  <CardDescription>
                    View and manage your wallet details
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="flex">
                      <Input 
                        value={user?.wallet || ''} 
                        readOnly 
                        className="font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="ml-2" 
                        onClick={copyToClipboard}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is your wallet address for deposits
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Chain Selection</Label>
                    <div className="bg-muted p-4 rounded-lg">
                      <ChainSwitcher />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Wallet Recovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Your wallet can be recovered using your email address. In production, this would use Privy's recovery mechanisms.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Export Recovery Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your wallet security preferences
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Spending Confirmation</Label>
                      <p className="text-sm text-muted-foreground">
                        Require confirmation for all transactions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authorize New Connections</Label>
                      <p className="text-sm text-muted-foreground">
                        Require approval for new dApp connections
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Transaction Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for all transactions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="border-t pt-4">
                    <Button variant="destructive" className="w-full">
                      Reset Wallet Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    readOnly 
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your account is linked to this email
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for additional security
                    </p>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transaction Confirmations</span>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Staking Rewards</span>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security Alerts</span>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing Updates</span>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fiat">
            <Card>
              <CardHeader>
                <CardTitle>Fiat Services Configuration</CardTitle>
                <CardDescription>
                  Manage your linked on-ramp/off-ramp services
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-app-blue flex items-center justify-center text-white">
                        C
                      </div>
                      <div>
                        <h3 className="font-medium">Coinbase Pay</h3>
                        <p className="text-sm text-muted-foreground">Global on-ramp/off-ramp solution</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-app-green mr-2">Connected</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-app-green flex items-center justify-center text-white">
                        Y
                      </div>
                      <div>
                        <h3 className="font-medium">Yellow Card</h3>
                        <p className="text-sm text-muted-foreground">Africa-focused payment solution</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">Disconnected</span>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Fiat Currency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="justify-start">USD</Button>
                    <Button variant="outline" className="justify-start">EUR</Button>
                    <Button variant="outline" className="justify-start">GBP</Button>
                    <Button variant="outline" className="justify-start">NGN</Button>
                    <Button variant="outline" className="justify-start">ZAR</Button>
                    <Button variant="outline" className="justify-start">KSH</Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button className="w-full">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
