import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PrivyConfigProvider, PrivyAuthProvider } from "@/contexts/PrivyAuthContext";
import { ChainProvider } from "@/contexts/ChainContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StakePage from "./pages/StakePage";
import WithdrawPage from "./pages/WithdrawPage";
import FiatPage from "./pages/FiatPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import SwapPage from "./pages/SwapPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Import inside the component to avoid circular dependency
import { usePrivyAuth } from "@/contexts/PrivyAuthContext";

// Protected route wrapper with improved handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = usePrivyAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-app-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only redirect to auth if not authenticated, but store current location
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// Public route wrapper to prevent authenticated users from accessing certain pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = usePrivyAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-app-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated and trying to access public routes like auth, redirect to dashboard
  // or to the originally requested page if coming from a protected route
  if (isAuthenticated && (location.pathname === '/auth')) {
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// AppRoutes with proper context provider wrapping
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <Dashboard />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/stake" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <StakePage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/withdraw" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <WithdrawPage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/fiat" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <FiatPage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <HistoryPage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <SettingsPage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <ProfilePage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      <Route path="/swap" element={
        <ProtectedRoute>
          <ChainProvider>
            <WalletProvider>
              <TransactionProvider>
                <SwapPage />
              </TransactionProvider>
            </WalletProvider>
          </ChainProvider>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Use refactored providers with correct nesting order
const AppWithProviders = () => (
  <BrowserRouter>
    <PrivyConfigProvider>
      <PrivyAuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </PrivyAuthProvider>
    </PrivyConfigProvider>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <AppWithProviders />
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
