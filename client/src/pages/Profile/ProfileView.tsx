import { Mail, Globe, User, AtSign } from 'lucide-react';
import type { Profile } from '../../lib/types';
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value || 'Not added yet'}
        </p>
      </div>
    </div>
  );
}

function SocialLinkCard({
  icon: Icon,
  label,
  url,
}: {
  icon: typeof FaXTwitter;
  label: string;
  url: string | null;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 p-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground/50">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground/70">Not added yet</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
          {url.replace(/^https?:\/\/(www\.)?/, '')}
        </p>
      </div>
    </a>
  );
}

export default function ProfileView({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Personal Information
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <InfoRow icon={User} label="Full Name" value={profile.full_name} />
          <InfoRow icon={AtSign} label="Username" value={profile.username ? `@${profile.username}` : ''} />
          <InfoRow icon={Mail} label="Email Address" value={profile.email} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">Bio</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.bio || (
            <span className="italic text-muted-foreground/60">No bio added yet.</span>
          )}
        </p>
      </section>

      <div className="border-t" />

      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">Social Links</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <SocialLinkCard icon={FaXTwitter} label="X (Twitter)" url={profile.twitter_url} />
          <SocialLinkCard icon={FaLinkedin} label="LinkedIn" url={profile.linkedin_url} />
          <SocialLinkCard icon={Globe} label="Website" url={profile.website_url} />
        </div>
      </section>
    </div>
  );
}
