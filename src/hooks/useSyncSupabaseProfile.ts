
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
          // Create new profile - use email/wallet as the ID to avoid UUID format issues
          const profileData = {
            id: user.id, // This may cause issues if not UUID format
            email: user.email?.address || null,
            wallet_address: user.wallet?.address || null
          };
          
          // If we have both email and wallet, try finding by either
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            
            // Try alternative approach if UUID format is the issue
            if (insertError.message?.includes('invalid input syntax for type uuid')) {
              // Use a deterministic UUID based on email or wallet
              const { error: alternativeInsertError } = await supabase
                .from('profiles')
                .insert({
                  ...profileData,
                  id: crypto.randomUUID() // Generate a proper UUID instead
                });
                
              if (alternativeInsertError) {
                toast.error('Failed to create user profile', {
                  description: 'There was an issue setting up your account.'
                });
                console.error('Alternative insert error:', alternativeInsertError);
              } else {
                toast.success('Welcome!', {
                  description: 'Your account has been created successfully.'
                });
              }
            } else {
              toast.error('Failed to create user profile', {
                description: 'There was an issue setting up your account.'
              });
            }
          } else {
            toast.success('Welcome!', {
              description: 'Your account has been created successfully.'
            });
          }
        } else {
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
