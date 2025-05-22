
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
      if (!authenticated || !user) return;
      
      setIsSyncing(true);
      try {
        console.log('Attempting to sync Privy user to Supabase profile');
        
        // Get user identifier - prioritize wallet address as email is disabled
        const userIdentifier = user.wallet?.address || user.email?.address;
        
        if (!userIdentifier) {
          console.error('No user identifier available');
          toast.error('Authentication Error', {
            description: 'Could not identify your account.'
          });
          setIsSyncing(false);
          return;
        }

        // Get current session - might be created from wallet-based auth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsSyncing(false);
          return;
        }

        // If we have no session yet, we cannot sync the profile
        if (!session) {
          console.log('No active session, waiting for authentication to complete');
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
          toast.error('Profile Error', {
            description: 'Could not verify your profile.'
          });
          setIsSyncing(false);
          return;
        }

        // If profile doesn't exist, create it
        if (!existingProfile) {
          console.log('Profile not found, creating new profile with ID:', userId);
          
          const profileData = {
            id: userId,
            email: user.email?.address || null,
            wallet_address: user.wallet?.address || null
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error('Profile Error', {
              description: 'Failed to create your profile. Please try again.'
            });
            setIsSyncing(false);
            return;
          }
          
          console.log('Profile created successfully');
        } else {
          console.log('Profile found:', existingProfile.id);
          
          // Update existing profile if needed
          const updates: any = {};
          let needsUpdate = false;
          
          if (user.email?.address && existingProfile.email !== user.email.address) {
            updates.email = user.email.address;
            needsUpdate = true;
          }
          
          if (user.wallet?.address && existingProfile.wallet_address !== user.wallet.address) {
            updates.wallet_address = user.wallet.address;
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
              toast.error('Profile Error', {
                description: 'Failed to update your profile.'
              });
            } else {
              console.log('Profile updated successfully');
            }
          }
        }
        
        setIsComplete(true);
      } catch (error) {
        console.error('Sync error:', error);
        toast.error('Profile Error', {
          description: 'There was a problem syncing your profile.'
        });
      } finally {
        setIsSyncing(false);
      }
    };

    if (authenticated && user && !isComplete) {
      syncWithSupabase();
    }
  }, [authenticated, user, isComplete]);

  return { isSyncing, isComplete };
};
