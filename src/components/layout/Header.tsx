
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Wallet } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="w-full py-4 px-4 md:px-8 border-b bg-white/80 backdrop-blur-sm fixed top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Network Untop Network
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user?.isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/stake" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                Stake
              </Link>
              <Link 
                to="/fiat" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                On-Ramp/Off-Ramp
              </Link>
              <Link 
                to="/withdraw" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                Withdraw
              </Link>
              <Link 
                to="/history" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                History
              </Link>
              <Link 
                to="/settings" 
                className="text-sm font-medium hover:text-app-purple transition-colors"
              >
                Settings
              </Link>
              <div className="flex items-center gap-2 text-sm text-app-gray">
                <Wallet size={16} />
                <span className="hidden xl:inline">
                  {user.wallet?.substring(0, 6)}...{user.wallet?.substring(user.wallet.length - 4)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => await logout()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              {!isHomePage && (
                <Link 
                  to="/" 
                  className="text-sm font-medium hover:text-app-purple transition-colors"
                >
                  Home
                </Link>
              )}
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {user?.isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/stake" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      Stake
                    </Link>
                    <Link 
                      to="/fiat" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      On-Ramp/Off-Ramp
                    </Link>
                    <Link 
                      to="/withdraw" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      Withdraw
                    </Link>
                    <Link 
                      to="/history" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      History
                    </Link>
                    <Link 
                      to="/settings" 
                      className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                    >
                      Settings
                    </Link>
                    <div className="flex items-center gap-2 text-app-gray py-2 border-b">
                      <Wallet size={18} />
                      {user.wallet?.substring(0, 6)}...{user.wallet?.substring(user.wallet.length - 4)}
                    </div>
                    <Button 
                      className="mt-4" 
                      onClick={async () => await logout()}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    {!isHomePage && (
                      <Link 
                        to="/" 
                        className="text-lg font-medium hover:text-app-purple transition-colors py-2 border-b"
                      >
                        Home
                      </Link>
                    )}
                    <Link to="/auth" className="mt-4">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
