
export interface AuthUser {
  email: string | null;
  wallet: string | null;
  isAuthenticated: boolean;
}

export interface AuthWalletContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
}
