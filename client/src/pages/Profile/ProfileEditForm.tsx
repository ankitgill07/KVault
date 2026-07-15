import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Check, User, AtSign, Mail, Globe, Upload, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

import type { Profile } from '../..//lib/types';
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";
import { userService } from '../../services/userService';
import { useUser } from '../../context/UserContext';

interface ProfileEditFormProps {
  profile: Profile;
  onSave: (values : Profile) => void;
  onCancel: () => void;
  saveState: 'idle' | 'saving' | 'saved';
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
  saveState,
}: ProfileEditFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(profile.avatar_url);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { updateUserProfile } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>({
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio ?? '',
      twitter_url: profile.twitter_url ?? '',
      linkedin_url: profile.linkedin_url ?? '',
      website_url: profile.website_url ?? '',
    },
  });

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPG, JPEG, and PNG files are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploadingImage(true);
    try {
      const response = await userService.uploadProfileImage(file);
      if (response.success) {
        // Update user context with new avatar
        await updateUserProfile({ avatar: response.data.avatar });
      } else {
        alert('Failed to upload image. Please try again.');
        setImagePreview(profile.avatar_url);
      }
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      setImagePreview(profile.avatar_url);
    } finally {
      setUploadingImage(false);
    }
  }, [profile.avatar_url, updateUserProfile]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      {/* Profile Image Upload */}
      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">Profile Image</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <label htmlFor="image-upload" className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Profile Picture</p>
            <p className="text-xs text-muted-foreground">JPG, JPEG, or PNG. Max 5MB.</p>
            {uploadingImage && <p className="text-xs text-primary">Uploading...</p>}
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Personal Information
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="full_name" placeholder="Enter your full name" className="pl-10" {...register('full_name')} required />
            </div>
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} disabled />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Tell us a little about yourself..." rows={4} {...register('bio')} />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </section>

      <div className="border-t" />

      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">Social Links</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="twitter_url">X (Twitter)</Label>
            <div className="relative">
              <FaXTwitter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="twitter_url" type="url" placeholder="https://twitter.com/..." className="pl-10" {...register('twitter_url')} />
            </div>
            {errors.twitter_url && <p className="text-sm text-destructive">{errors.twitter_url.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedin_url">LinkedIn</Label>
            <div className="relative">
              <FaLinkedin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." className="pl-10" {...register('linkedin_url')} />
            </div>
            {errors.linkedin_url && <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website_url">Website</Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="website_url" type="url" placeholder="https://yoursite.com" className="pl-10" {...register('website_url')} />
            </div>
            {errors.website_url && <p className="text-sm text-destructive">{errors.website_url.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={saveState === 'saving' || uploadingImage}>
          {saveState === 'saving' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : saveState === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
