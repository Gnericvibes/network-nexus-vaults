
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
  LockIcon,
  LogIn,
  UserPlus
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer noFooter className="bg-teal-900 text-white">
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Language Selector (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center">
          <span className="mr-2">English</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
        </div>

        {/* Main Content */}
        <div className="text-center px-4 z-10">
          {/* Logo */}
          <div className="mb-4">
            <img 
              src="/lovable-uploads/a6e75e43-8303-45e1-9873-d0a45fffe034.png" 
              alt="Network Untop Network Logo" 
              className="w-80 h-auto mx-auto"
            />
          </div>
          
          {/* Tagline */}
          <h1 className="text-xl md:text-3xl font-medium mb-16 tracking-wider">
            SIMPLE, FAST AND SAFE STAKING
          </h1>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-teal-500 hover:bg-teal-600 text-white border-none py-6 text-lg w-full"
            >
              <LogIn className="mr-2 h-5 w-5" />
              LOGIN
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              variant="outline" 
              className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 py-6 text-lg w-full"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              SIGN UP
            </Button>
          </div>
        </div>
        
        {/* Background Leaves/Graphics (Optional) */}
        <div className="absolute left-0 bottom-0 opacity-30 z-0">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M150,10 Q200,150 290,150 Q200,250 150,290 Q100,250 10,150 Q100,50 150,10Z" fill="#134e4a" />
          </svg>
        </div>
        <div className="absolute right-0 top-1/4 opacity-30 z-0">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100,10 Q150,50 190,100 Q150,150 100,190 Q50,150 10,100 Q50,50 100,10Z" fill="#134e4a" />
          </svg>
        </div>
      </div>
    </PageContainer>
  );
};

export default Landing;
