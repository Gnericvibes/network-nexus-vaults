
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChainProvider } from "@/contexts/ChainContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";

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
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-app-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/auth" element={<Auth />} />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/stake" element={
      <ProtectedRoute>
        <StakePage />
      </ProtectedRoute>
    } />
    <Route path="/withdraw" element={
      <ProtectedRoute>
        <WithdrawPage />
      </ProtectedRoute>
    } />
    <Route path="/fiat" element={
      <ProtectedRoute>
        <FiatPage />
      </ProtectedRoute>
    } />
    <Route path="/history" element={
      <ProtectedRoute>
        <HistoryPage />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    } />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ChainProvider>
          <WalletProvider>
            <TransactionProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TransactionProvider>
          </WalletProvider>
        </ChainProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
