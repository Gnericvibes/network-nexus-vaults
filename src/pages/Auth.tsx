
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft, Shield, Wallet } from 'lucide-react';

const Auth: React.FC = () => {
  const { login } = usePrivy();
  const navigate = useNavigate();

  return (
    <PageContainer className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center gradient-text">
              Welcome to Network Untop Network
            </CardTitle>
            <CardDescription className="text-center">
              Connect your wallet or email to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <Shield className="h-12 w-12 text-app-purple" />
            </div>

            <Button 
              className="w-full mb-4"
              onClick={login}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 hover:text-primary">
                Privacy Policy
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Auth;
