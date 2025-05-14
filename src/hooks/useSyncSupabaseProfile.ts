
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as PrivyUser } from '@privy-io/react-auth';

export const useSyncSupabaseProfile = (
  authenticated: boolean,
  user: PrivyUser | null
) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncAttemptCount, setSyncAttemptCount] = useState(0);
  const MAX_SYNC_ATTEMPTS = 3;

  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!authenticated || !user) return;
      
      setIsSyncing(true);
      try {
        console.log('Attempting to sync Privy user to Supabase profile');
        
        // Define user email identifier - use wallet address if email not available
        const userIdentifier = user.email?.address || user.wallet?.address;
        
        if (!userIdentifier) {
          console.error('No user identifier available');
          return;
        }

        // First, check if the user exists in auth.users
        // This is important since we're using RLS and need to be authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If there's no session, we need to create one
          // This is a simplified approach - in production we would need a more robust solution
          console.log('No active Supabase session, attempting to create session');
          
          // For now, we'll just skip the profile creation if no session
          setIsSyncing(false);
          return;
        }

        // Check if profile exists by email or wallet
        let profileQuery = supabase.from('profiles').select('*');
        
        if (user.email?.address) {
          profileQuery = profileQuery.eq('email', user.email.address);
        } else if (user.wallet?.address) {
          profileQuery = profileQuery.eq('wallet_address', user.wallet.address);
        }
        
        const { data: profile, error: fetchError } = await profileQuery.maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          toast.error('Authentication Error', {
            description: 'Could not verify your account.'
          });
          return;
        }

        if (!profile) {
          console.log('Profile not found, creating new profile');
          // Use the user's UUID from the session as the profile ID
          // This is critical for RLS to work correctly
          const profileId = session.user.id;
          
          // Create new profile with user's UUID
          const profileData = {
            id: profileId,
            email: user.email?.address || null,
            wallet_address: user.wallet?.address || null
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            
            // Check if it's a duplicate key error, which might mean the profile exists
            // but with different email/wallet - in that case we should update instead
            if (insertError.code === '23505') { // Unique violation
              console.log('Profile may exist with different details, attempting update');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  email: user.email?.address || null,
                  wallet_address: user.wallet?.address || null
                })
                .eq('id', profileId);
                
              if (updateError) {
                console.error('Error updating existing profile:', updateError);
                toast.error('Failed to update user profile', {
                  description: 'There was an issue updating your account. Please try again.'
                });
              } else {
                console.log('Profile updated successfully');
                toast.success('Welcome back!', {
                  description: 'Your account has been updated successfully.'
                });
                setSyncAttemptCount(0); // Reset attempt count on success
              }
            } else {
              toast.error('Failed to create user profile', {
                description: 'There was an issue setting up your account. Please try again.'
              });
              
              // Try again if we haven't exceeded max attempts
              if (syncAttemptCount < MAX_SYNC_ATTEMPTS) {
                setSyncAttemptCount(prev => prev + 1);
              }
            }
          } else {
            console.log('Profile created successfully');
            toast.success('Welcome!', {
              description: 'Your account has been created successfully.'
            });
            setSyncAttemptCount(0); // Reset attempt count on success
          }
        } else {
          console.log('Profile found, checking for updates');
          // Profile exists, update it if needed
          const updates: any = {};
          let needsUpdate = false;
          
          // Update email if it's new
          if (user.email?.address && profile.email !== user.email.address) {
            updates.email = user.email.address;
            needsUpdate = true;
          }
          
          // Update wallet address if it's new
          if (user.wallet?.address && profile.wallet_address !== user.wallet.address) {
            updates.wallet_address = user.wallet.address;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            console.log('Updating profile with new data');
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', profile.id);
              
            if (updateError) {
              console.error('Error updating profile:', updateError);
            } else {
              console.log('Profile updated successfully');
            }
          }
        }
      } catch (error) {
        console.error('Sync error:', error);
        toast.error('Authentication Error', {
          description: 'There was a problem syncing your account.'
        });
      } finally {
        setIsSyncing(false);
      }
    };

    if (authenticated && user) {
      syncWithSupabase();
    }
  }, [authenticated, user, syncAttemptCount]);

  // Retry sync if needed based on attempt count
  useEffect(() => {
    let retryTimer: number;
    
    if (syncAttemptCount > 0 && syncAttemptCount <= MAX_SYNC_ATTEMPTS && !isSyncing) {
      console.log(`Retrying sync attempt ${syncAttemptCount} of ${MAX_SYNC_ATTEMPTS}`);
      retryTimer = window.setTimeout(() => {
        // This will trigger the main useEffect again
      }, 2000); // Wait 2 seconds between retries
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [syncAttemptCount, isSyncing]);

  return { isSyncing };
};
