
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BadgeDollarSign, CalendarClock, Wallet, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <PageContainer>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 p-6 pt-20">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Network Untop Network
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A decentralized, non-custodial savings platform that helps you save in USDC, 
            create personalized goals, and withdraw directly to your bank account.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
              <BadgeDollarSign className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">USDC Savings</h3>
              <p className="text-gray-600">
                Save in stable USDC, protecting your funds from inflation and volatility.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
              <CalendarClock className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Custom Lock Periods</h3>
              <p className="text-gray-600">
                Choose from preset durations or create your own custom lock-in periods.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
              <Wallet className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bank Withdrawals</h3>
              <p className="text-gray-600">
                Add your bank accounts for direct off-ramping after your savings mature.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg"
              onClick={() => navigate('/landing')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Index;
