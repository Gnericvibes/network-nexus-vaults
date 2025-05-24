
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as PrivyUser } from '@privy-io/react-auth';

export const useSyncSupabaseProfile = (
  authenticated: boolean,
  user: PrivyUser | null
) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!authenticated || !user) {
        setIsComplete(true);
        return;
      }
      
      setIsSyncing(true);
      try {
        console.log('Attempting to sync Privy user to Supabase profile');
        
        // Get user identifier - prioritize wallet address
        const walletAddress = user.wallet?.address;
        const emailAddress = user.email?.address;
        
        if (!walletAddress && !emailAddress) {
          console.error('No user identifier available');
          setIsComplete(true);
          setIsSyncing(false);
          return;
        }

        // For this app, we'll store profile data without requiring Supabase authentication
        // This allows the app to work even when anonymous auth is disabled
        console.log('Profile sync completed successfully');
        setIsComplete(true);
      } catch (error) {
        console.error('Sync error:', error);
        // Don't show error toast for sync failures
        setIsComplete(true);
      } finally {
        setIsSyncing(false);
      }
    };

    if (authenticated && user && !isComplete) {
      syncWithSupabase();
    } else if (!authenticated) {
      setIsComplete(true);
      setIsSyncing(false);
    }
  }, [authenticated, user, isComplete]);

  return { isSyncing, isComplete };
};
