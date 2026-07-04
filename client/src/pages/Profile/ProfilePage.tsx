import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import ProfileSidebar from './ProfileSidebar';
import ProfileView from './ProfileView';
import ProfileEditForm from './ProfileEditForm';
import ProfileLoading from './ProfileLoading';
import AchievementsTab from './AchievementsTab';
import { type Profile } from '../../lib/types';
import { userService } from '../../services/userService';
import { useUser } from '../../context/UserContext';


export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { fetchUserProfile } = useUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getProfile();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const profileData: Profile = {
          id: userData.id,
          full_name: userData.name,
          username: userData.profileName || userData.name,
          email: userData.email,
          bio: userData.bio || null,
          avatar_url: userData.avatar || null,
          twitter_url: userData.twitterUrl || null,
          linkedin_url: userData.linkedinUrl || null,
          website_url: userData.websiteUrl || null,
        };
        setProfile(profileData);
        // Update context with profile data
        await fetchUserProfile();
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSave(values: any) {
    setSaveState('saving');
    try {
      const response = await userService.updateProfile({
        profileName: values.username,
        bio: values.bio,
        twitterUrl: values.twitter_url,
        linkedinUrl: values.linkedin_url,
        websiteUrl: values.website_url,
      });

      if (response.success) {
        setSaveState('saved');
        setIsEditing(false);
        // Refresh profile data
        await fetchProfile();
        setTimeout(() => setSaveState('idle'), 2500);
      } else {
        setError('Failed to save profile. Please try again.');
        setSaveState('idle');
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      setSaveState('idle');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <ProfileLoading />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your personal information
            </p>
          </div>
          {!isEditing && (
            <Button variant="default" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left Sidebar */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ProfileSidebar profile={profile} />
          </div>

          {/* Main Content */}
          <Card className="p-6 sm:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isEditing ? 'edit' : 'view'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {isEditing ? (
                      <ProfileEditForm
                        profile={profile}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        saveState={saveState}
                      />
                    ) : (
                      <ProfileView profile={profile} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="achievements">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AchievementsTab />
                </motion.div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
