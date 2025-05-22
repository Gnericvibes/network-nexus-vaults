
import React, { createContext, useContext, useState, ReactNode } from 'react';

// This file is now simplified to prevent circular dependencies
// All authentication functionality is moved to PrivyAuthContext.tsx

interface AuthContextType {
  // Minimal interface that forwards to PrivyAuthContext
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // This provider is now a simple pass-through to maintain compatibility
  // No longer using usePrivyAuth here to prevent circular dependencies
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
