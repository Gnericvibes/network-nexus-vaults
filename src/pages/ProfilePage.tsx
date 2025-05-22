
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
}

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    id: null,
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isAuthenticated) {
      fetchProfileData();
    } else {
      // Small delay to ensure auth state is properly checked
      const timer = setTimeout(() => {
        if (!user?.isAuthenticated) {
          navigate('/auth');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      // First get the user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setFetchError('Could not verify your session. Please log in again.');
        return;
      }
      
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        console.error("No user ID found in session");
        setFetchError('No user session found. Please log in again.');
        return;
      }
      
      console.log('Fetching profile for user ID:', userId);
      
      // Then query the profiles table using the user ID
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, bio, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setFetchError('Failed to load profile data. Please try again later.');
        return;
      }
      
      if (data) {
        console.log('Profile data retrieved:', data);
        setProfileData({
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      } else {
        console.log("No profile found for user ID:", userId);
        // Profile doesn't exist, create a new one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId })
          .select();
          
        if (insertError) {
          console.error('Error creating new profile:', insertError);
          setFetchError('Failed to create a profile. Please try again.');
          return;
        }
        
        setProfileData({
          id: userId,
          first_name: '',
          last_name: '',
          bio: '',
          avatar_url: '',
        });
      }
    } catch (error) {
      console.error('Unexpected error during profile fetch:', error);
      setFetchError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.isAuthenticated || !profileData.id) {
      toast.error('Not authenticated', { 
        description: 'Please log in to save your profile'
      });
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
        })
        .eq('id', profileData.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile', {
          description: error.message
        });
        return;
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error in save operation:', error);
      toast.error('Failed to update profile', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = profileData.first_name?.charAt(0) || '';
    const last = profileData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
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
  
  if (fetchError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-xl text-red-500 font-medium">{fetchError}</div>
          <Button 
            onClick={() => fetchProfileData()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
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
                  ? `${profileData.first_name || ''} ${profileData.last_name || ''}` 
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
