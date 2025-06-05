
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit, Save, Loader2, RefreshCcw } from 'lucide-react';
import BankAccountsList from '@/components/profile/BankAccountsList';
import { toast } from 'sonner';

interface ProfileData {
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  wallet_address: string | null;
}

const ProfilePage = () => {
  const { user, isAuthenticated } = usePrivyAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    id: null,
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
    email: '',
    wallet_address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchOrCreateProfile();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchOrCreateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Use the user's email or wallet address as the unique identifier
      const userIdentifier = user.email || user.wallet;
      
      if (!userIdentifier) {
        console.error('No user identifier found');
        toast.error('Unable to identify user. Please try logging in again.');
        return;
      }

      console.log('Fetching profile for user:', userIdentifier);
      
      // Try to find existing profile by email or wallet address
      let { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${user.email},wallet_address.eq.${user.wallet}`)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        toast.error('Failed to load profile data');
        return;
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        setProfileData({
          id: existingProfile.id,
          first_name: existingProfile.first_name || '',
          last_name: existingProfile.last_name || '',
          bio: existingProfile.bio || '',
          avatar_url: existingProfile.avatar_url || '',
          email: existingProfile.email || user.email || '',
          wallet_address: existingProfile.wallet_address || user.wallet || '',
        });
      } else {
        console.log('No existing profile found, creating new one');
        // Create a new profile - let Supabase handle the ID generation
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            email: user.email,
            wallet_address: user.wallet,
            first_name: null,
            last_name: null,
            bio: null,
            avatar_url: null,
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error('Failed to create profile');
          return;
        }

        console.log('Created new profile:', newProfile);
        setProfileData({
          id: newProfile.id,
          first_name: '',
          last_name: '',
          bio: '',
          avatar_url: '',
          email: user.email || '',
          wallet_address: user.wallet || '',
        });
      }
    } catch (error) {
      console.error('Unexpected error during profile fetch/create:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.id) {
      toast.error('No profile ID found');
      return;
    }

    try {
      setIsSaving(true);
      
      console.log('Saving profile data:', profileData);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          email: profileData.email,
          wallet_address: profileData.wallet_address,
        })
        .eq('id', profileData.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error in save operation:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = profileData.first_name?.charAt(0) || '';
    const last = profileData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {profileData.avatar_url ? (
                <AvatarImage src={profileData.avatar_url} alt="Profile picture" />
              ) : (
                <AvatarFallback>{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {profileData.first_name || profileData.last_name 
                  ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
                  : 'Your Profile'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your profile information and bank accounts
              </p>
            </div>
          </div>
          {activeTab === 'personal' && (
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="mt-4 md:mt-0"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.first_name || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.last_name || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    value={profileData.wallet_address || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, wallet_address: e.target.value }))}
                    disabled={!isEditing}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <BankAccountsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
