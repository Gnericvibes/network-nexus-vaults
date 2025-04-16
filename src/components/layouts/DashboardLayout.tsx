
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { 
  Home, 
  PiggyBank, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/dashboard" },
    { label: "My Goals", icon: <PiggyBank className="h-5 w-5" />, path: "/goals" },
    { label: "Wallet", icon: <Wallet className="h-5 w-5" />, path: "/wallet" },
    { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, path: "/analytics" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-teal-900 to-teal-950">
      {/* Sidebar */}
      <div className="w-64 bg-teal-800/40 backdrop-blur-sm border-r border-teal-700/30 p-5 flex flex-col">
        <div className="mb-8 flex justify-center">
          <Link to="/dashboard">
            <Logo className="w-36" />
          </Link>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive(item.path)
                        ? "bg-teal-700/60 text-white"
                        : "text-teal-300 hover:bg-teal-700/40 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-teal-700/30">
          <Button variant="ghost" className="w-full justify-start text-teal-300 hover:bg-teal-700/40 hover:text-white">
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-teal-700/30 bg-teal-800/20 backdrop-blur-sm flex items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="relative text-teal-300 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-teal-400 rounded-full"></span>
            </Button>
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
