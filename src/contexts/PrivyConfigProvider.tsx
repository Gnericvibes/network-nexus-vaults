
import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

interface PrivyConfigProviderProps {
  children: ReactNode;
}

export const PrivyConfigProvider: React.FC<PrivyConfigProviderProps> = ({ children }) => {
  const PRIVY_APP_ID = 'cm9lz7gq800d4l80mm0p6xze7';
  
  console.log('Using Privy App ID:', PRIVY_APP_ID);

  if (!PRIVY_APP_ID) {
    console.error('Privy App ID is missing');
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-red-600">Configuration Error</h2>
          <p className="mb-4">
            The Privy App ID is not properly configured. Please add your Privy App ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
