export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
}

export const DEFAULT_PROFILE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
