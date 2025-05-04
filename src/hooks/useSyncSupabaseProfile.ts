
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as PrivyUser } from '@privy-io/react-auth';

export const useSyncSupabaseProfile = (
  authenticated: boolean,
  user: PrivyUser | null
) => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!authenticated || !user) return;
      
      setIsSyncing(true);
      try {
        // Define user email identifier - use wallet address if email not available
        const userIdentifier = user.email?.address || user.wallet?.address;
        
        if (!userIdentifier) {
          console.error('No user identifier available');
          return;
        }

        let profile = null;
        let fetchError = null;

        // Check if profile exists by email or wallet
        if (user.email?.address && user.wallet?.address) {
          // Check for both email and wallet
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.eq.${user.email.address},wallet_address.eq.${user.wallet.address}`)
            .maybeSingle();
          
          profile = data;
          fetchError = error;
        } else if (user.email?.address) {
          // Only email is available
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email.address)
            .maybeSingle();
          
          profile = data;
          fetchError = error;
        } else if (user.wallet?.address) {
          // Only wallet is available
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', user.wallet.address)
            .maybeSingle();
          
          profile = data;
          fetchError = error;
        }

        if (!profile && !fetchError) {
          // Create new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email?.address || null,
              wallet_address: user.wallet?.address || null
            });

          if (insertError) {
            toast.error('Failed to create user profile', {
              description: 'There was an issue setting up your account.'
            });
            console.error('Error creating profile:', insertError);
          } else {
            toast.success('Welcome!', {
              description: 'Your account has been created successfully.'
            });
          }
        } else if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          toast.error('Authentication Error', {
            description: 'Could not verify your account.'
          });
        } else if (profile) {
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
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', profile.id);
              
            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          }
        }
      } catch (error) {
        toast.error('Authentication Error', {
          description: 'There was a problem syncing your account.'
        });
        console.error('Sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    if (authenticated && user) {
      syncWithSupabase();
    }
  }, [authenticated, user]);

  return { isSyncing };
};
