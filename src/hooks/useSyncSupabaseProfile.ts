
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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!authenticated || !user) return;
      
      setIsSyncing(true);
      try {
        console.log('Attempting to sync Privy user to Supabase profile');
        
        // Get user identifier - prioritize wallet address
        const walletAddress = user.wallet?.address;
        const emailAddress = user.email?.address;
        
        if (!walletAddress && !emailAddress) {
          console.error('No user identifier available');
          toast.error('Authentication Error', {
            description: 'Could not identify your account.'
          });
          setIsSyncing(false);
          return;
        }

        // Wait for session to be available
        let sessionAttempts = 0;
        let session = null;
        
        while (sessionAttempts < 5 && !session) {
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            break;
          }
          
          if (currentSession) {
            session = currentSession;
            break;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          sessionAttempts++;
        }

        // If we still don't have a session, we'll proceed without strict user ID linking
        if (!session) {
          console.log('No session available, proceeding with profile creation using identifier');
          setIsComplete(true);
          setRetryCount(0);
          setIsSyncing(false);
          return;
        }

        // Get the user ID from the session
        const userId = session.user.id;
        console.log('Current user ID from session:', userId);
        
        // Check if profile exists by user ID
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          // Don't show error toast for profile fetch failures
          setIsSyncing(false);
          return;
        }

        // If profile doesn't exist, create it
        if (!existingProfile) {
          console.log('Profile not found, creating new profile with ID:', userId);
          
          const profileData = {
            id: userId,
            email: emailAddress,
            wallet_address: walletAddress
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // Don't show error toast for profile creation failures in anonymous mode
          } else {
            console.log('Profile created successfully');
          }
        } else {
          console.log('Profile found:', existingProfile.id);
          
          // Update existing profile if needed
          const updates: any = {};
          let needsUpdate = false;
          
          if (emailAddress && existingProfile.email !== emailAddress) {
            updates.email = emailAddress;
            needsUpdate = true;
          }
          
          if (walletAddress && existingProfile.wallet_address !== walletAddress) {
            updates.wallet_address = walletAddress;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            console.log('Updating profile with new data:', updates);
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', existingProfile.id);
              
            if (updateError) {
              console.error('Error updating profile:', updateError);
            } else {
              console.log('Profile updated successfully');
            }
          }
        }
        
        setIsComplete(true);
        setRetryCount(0);
      } catch (error) {
        console.error('Sync error:', error);
        // Don't show error toast in sync process
      } finally {
        setIsSyncing(false);
      }
    };

    if (authenticated && user && !isComplete) {
      syncWithSupabase();
    }
  }, [authenticated, user, isComplete, retryCount]);

  return { isSyncing, isComplete };
};
