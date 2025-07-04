
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Wallet } from 'lucide-react';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const { login, isLoading } = usePrivyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the pathname from location state, or default to dashboard
  const from = location.state?.from || '/dashboard';

  const handleLogin = async () => {
    try {
      await login();
      // Navigation will be handled by PublicRoute instead of here
      toast.success('Sign in successful', {
        description: 'Redirecting to your dashboard',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Sign in failed', {
        description: 'Please try again',
      });
    }
  };

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
              Sign in with email or connect your wallet
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-center mb-6">
                <Shield className="h-12 w-12 text-app-purple" />
              </div>
              
              <div className="flex flex-col space-y-4">
                <Button 
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isLoading ? 'Loading...' : 'Continue with Email'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isLoading ? 'Loading...' : 'Connect Wallet'}
                </Button>
              </div>
            </div>
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
              .
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Auth;
