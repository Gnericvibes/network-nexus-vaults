
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Shield, 
  BadgeDollarSign, 
  TrendingUp, 
  ArrowRight, 
  BanknoteIcon, 
  Building, 
  LockIcon
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Your Secure Decentralized Savings Account
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Earn competitive yields on your USDC savings with Network Untop Network's
            secure staking platform powered by SwellChain and Base.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg"
              onClick={() => navigate('/auth')}
            >
              Start Saving <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border">
              <BadgeDollarSign className="h-12 w-12 text-app-purple mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save in USDC</h3>
              <p className="text-gray-600 text-center">
                Protect your savings from inflation by holding stable USDC with guaranteed returns.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border">
              <TrendingUp className="h-12 w-12 text-app-purple mb-4" />
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600 text-center">
                Stake your USDC to earn competitive yields on SwellChain and Base protocols.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border">
              <Shield className="h-12 w-12 text-app-purple mb-4" />
              <h3 className="text-xl font-semibold mb-2">Maximum Security</h3>
              <p className="text-gray-600 text-center">
                Your funds are secured by industry-leading blockchain protocols and smart contracts.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            The Future of <span className="gradient-text">Decentralized Savings</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Stake with Confidence</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Building className="h-6 w-6 text-app-purple mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">SwellChain Protocol</h4>
                    <p className="text-gray-600">
                      Leverage Ethereum's security with SwellChain's liquid staking solution for maximum returns on your USDC.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <Building className="h-6 w-6 text-app-blue mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Base Protocol</h4>
                    <p className="text-gray-600">
                      Utilize Coinbase's Base chain for lower fees and institutional-grade security for your USDC savings.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <LockIcon className="h-6 w-6 text-app-purple mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Flexible Lock Periods</h4>
                    <p className="text-gray-600">
                      Choose lock periods of 3, 6, or 12 months to maximize your yield based on your financial goals.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-white p-8 shadow-md border">
              <h3 className="text-2xl font-semibold mb-4">Seamless Fiat Integration</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <BanknoteIcon className="h-6 w-6 text-app-green mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Yellow Card Integration</h4>
                    <p className="text-gray-600">
                      Easily on-ramp and off-ramp between local African currencies and USDC through Yellow Card's API.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <BanknoteIcon className="h-6 w-6 text-app-blue mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Coinbase Pay</h4>
                    <p className="text-gray-600">
                      Global users can securely purchase USDC directly using Coinbase Pay with their linked accounts.
                    </p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full"
                >
                  Start Saving Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="w-full py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            How It <span className="gradient-text">Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-app-purple text-white flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account with email authentication through Privy. A secure wallet will be created for you automatically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-app-purple text-white flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Deposit USDC</h3>
              <p className="text-gray-600">
                On-ramp fiat to USDC using Yellow Card or Coinbase Pay, or transfer existing USDC to your wallet.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-app-purple text-white flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Staking</h3>
              <p className="text-gray-600">
                Choose your preferred protocol (SwellChain or Base) and lock period to start earning rewards on your USDC.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Landing;
