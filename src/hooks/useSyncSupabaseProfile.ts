
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
  const [isComplete, setIsComplete] = useState(false);
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
          toast.error('Authentication Error', {
            description: 'Could not identify your account.'
          });
          return;
        }

        // First, check if the user exists in auth.users by trying to get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          toast.error('Authentication Error', {
            description: 'Could not verify your session.'
          });
          return;
        }

        if (!session) {
          console.log('No active Supabase session, creating anonymous session');
          
          const { error: anonError } = await supabase.auth.signInAnonymously();
          if (anonError) {
            console.error('Failed to create anonymous session:', anonError);
            toast.error('Authentication Error', {
              description: 'Could not create a session for your account.'
            });
            return;
          }
          
          // Get the new session
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (!newSession) {
            console.error('Still no session after anonymous sign-in');
            return;
          }
        }
        
        // Get the latest session again to ensure we have it
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          console.error('No session available after attempts to create one');
          return;
        }

        // Get the user ID from the session
        const userId = currentSession.user.id;
        if (!userId) {
          console.error('No user ID in session');
          return;
        }
        
        // Check if profile exists by user ID
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          toast.error('Authentication Error', {
            description: 'Could not verify your account.'
          });
          return;
        }

        if (!profile) {
          console.log('Profile not found, creating new profile');
          
          // Create new profile with user's UUID
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
                .eq('id', userId);
                
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
                setIsComplete(true);
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
            setIsComplete(true);
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
          
          setIsComplete(true);
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

    if (authenticated && user && !isComplete) {
      syncWithSupabase();
    }
  }, [authenticated, user, syncAttemptCount, isComplete]);

  // Retry sync if needed based on attempt count
  useEffect(() => {
    let retryTimer: number;
    
    if (syncAttemptCount > 0 && syncAttemptCount <= MAX_SYNC_ATTEMPTS && !isSyncing && !isComplete) {
      console.log(`Retrying sync attempt ${syncAttemptCount} of ${MAX_SYNC_ATTEMPTS}`);
      retryTimer = window.setTimeout(() => {
        // This will trigger the main useEffect again
      }, 2000); // Wait 2 seconds between retries
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [syncAttemptCount, isSyncing, isComplete]);

  return { isSyncing, isComplete };
};
