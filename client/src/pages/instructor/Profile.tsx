import { useState, useEffect } from 'react';
import { userService, type UserProfile } from '../../services/userService';
import { courseService } from '../../services/courseService';
import {
  User,
  Mail,
  Globe,
  Star,
  Users,
  DollarSign,
  BookOpen,
  Save,
  Camera,
  Loader2,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const socialLinks = [
  { key: 'twitterUrl', label: 'Twitter', icon: <TwitterIcon size={18} /> },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: <LinkedinIcon size={18} /> },
];

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Stats computed from actual courses
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 4.8,
  });

  const [formData, setFormData] = useState({
    profileName: '',
    bio: '',
    avatar: '',
    websiteUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, coursesRes] = await Promise.all([
          userService.getProfile(),
          courseService.getMyCourses(),
        ]);

        if (profileRes?.data) {
          const uProfile = profileRes.data;
          setProfile(uProfile);
          setFormData({
            profileName: uProfile.profileName || uProfile.name || '',
            bio: uProfile.bio || '',
            avatar: uProfile.avatar || '',
            websiteUrl: uProfile.websiteUrl || '',
            twitterUrl: uProfile.twitterUrl || '',
            linkedinUrl: uProfile.linkedinUrl || '',
          });
        }

        if (coursesRes) {
          const totalCourses = coursesRes.length;
          const totalStudents = coursesRes.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
          const totalRevenue = coursesRes.reduce((sum, c) => sum + ((c.enrollmentCount || 0) * (c.price || 0)), 0);
          const averageRating = totalCourses > 0
            ? parseFloat((coursesRes.reduce((sum, c) => sum + (c.rating || 0), 0) / totalCourses).toFixed(1))
            : 4.8;

          setStats({
            totalCourses,
            totalStudents,
            totalRevenue,
            averageRating,
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userService.updateProfile({
        profileName: formData.profileName,
        bio: formData.bio,
        websiteUrl: formData.websiteUrl,
        twitterUrl: formData.twitterUrl,
        linkedinUrl: formData.linkedinUrl,
      });

      if (response?.data) {
        setProfile(response.data);
        setEditMode(false);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await userService.uploadProfileImage(file);
      if (response?.data?.avatar) {
        setFormData((prev) => ({ ...prev, avatar: response.data.avatar }));
        if (profile) {
          setProfile({ ...profile, avatar: response.data.avatar });
        }
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Instructor Profile</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your public instructor identity and details.</p>
        </div>
        {!editMode && (
          <Button onClick={() => setEditMode(true)} className="rounded-xl shadow-lg">
            Edit Profile
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">Total Revenue</p>
        </Card>

        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {stats.totalStudents.toLocaleString()}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">Total Students</p>
        </Card>

        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {stats.totalCourses}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">Active Courses</p>
        </Card>

        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-3">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-450 fill-amber-500" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {stats.averageRating.toFixed(1)}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">Average Rating</p>
        </Card>
      </div>

      {/* Main Profile Info */}
      <Card className="p-8 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
        {editMode ? (
          <div className="space-y-6">
            {/* Avatar Update */}
            <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/85">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-zinc-150 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-md">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold text-3xl">
                      {formData.profileName?.charAt(0) || profile?.name?.charAt(0) || 'I'}
                    </span>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850 transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  <Camera size={16} className="text-zinc-600 dark:text-zinc-450" />
                </label>
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Profile Picture</h3>
                <p className="text-xs text-zinc-400 mt-1">PNG, JPG or WEBP. Upload high-res for better layout display.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.profileName}
                  onChange={(e) =>
                    setFormData({ ...formData, profileName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Instructor Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Personal Website / Link
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Bio / Professional Headline
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  placeholder="Share a short summary of your background, experience and style of lecturing..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/85">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">
                Social Profiles
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialLinks.map(({ key, label, icon }) => (
                  <div key={key} className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-450">
                      {icon}
                    </div>
                    <input
                      type="url"
                      value={formData[key as 'twitterUrl' | 'linkedinUrl']}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder={`${label} Profile URL`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/85">
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.profileName.trim() || saving}
                className="rounded-xl shadow-lg px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : profile ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar View */}
            <div className="w-32 h-32 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700 shadow-md">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-zinc-700 dark:text-zinc-300 font-bold text-4xl">
                  {(profile.profileName || profile.name)?.charAt(0) || 'I'}
                </span>
              )}
            </div>

            {/* Info View */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {profile.profileName || profile.name}
                  </h2>
                  <Badge variant="secondary" className="rounded-full text-[10px] px-2.5 py-0.5">
                    {profile.role?.toUpperCase() || 'INSTRUCTOR'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs">{profile.email}</span>
                </div>

                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline mt-2"
                  >
                    <Globe size={13} />
                    {profile.websiteUrl}
                  </a>
                )}
              </div>

              {profile.bio ? (
                <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-sm text-zinc-400 italic">No bio or headline provided yet. Click edit to customize.</p>
              )}

              {/* Social Links */}
              {(profile.twitterUrl || profile.linkedinUrl) && (
                <div className="flex items-center gap-3 pt-2">
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <TwitterIcon size={16} />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-sm mb-4">No instructor profile data found.</p>
            <Button onClick={() => setEditMode(true)} className="rounded-xl">
              Create Profile Details
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
