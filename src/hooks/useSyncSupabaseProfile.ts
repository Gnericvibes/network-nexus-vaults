
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
        
        // Define user email identifier - use wallet address if email not available
        const userIdentifier = user.email?.address || user.wallet?.address;
        
        if (!userIdentifier) {
          console.error('No user identifier available');
          toast.error('Authentication Error', {
            description: 'Could not identify your account.'
          });
          setIsSyncing(false);
          return;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Error getting session:', sessionError || 'No session found');
          setIsSyncing(false);
          return;
        }

        // Get the user ID from the session
        const userId = session.user.id;
        if (!userId) {
          console.error('No user ID in session');
          setIsSyncing(false);
          return;
        }
        
        // Check if profile exists by user ID
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          toast.error('Authentication Error', {
            description: 'Could not verify your account.'
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
            toast.error('Failed to create user profile', {
              description: 'There was an issue setting up your account. Please try again.'
            });
            setIsSyncing(false);
            return;
          }
          
          console.log('Profile created successfully');
          toast.success('Welcome!', {
            description: 'Your account has been created successfully.'
          });
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
            console.log('Updating profile with new data');
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
  }, [authenticated, user, isComplete]);

  return { isSyncing, isComplete };
};
