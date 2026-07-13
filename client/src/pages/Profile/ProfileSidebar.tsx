import { Mail, Globe } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import type { Profile } from "../../lib/types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileSidebar({ profile }: { profile: Profile }) {

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative h-28 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="-mt-16 flex justify-center">
          <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
            <AvatarImage
              src={profile.avatar_url as string}
              alt={profile.full_name}
            />
            <AvatarFallback className="text-4xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold text-foreground">
            {profile.full_name || "Your Name"}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {profile.username ? `@${profile.username}` : "@username"}
          </p>
          <div className="mt-3 flex justify-center">
            <Badge variant="secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </Badge>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t pt-5">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">
              {profile.email || "No email added"}
            </span>
          </div>
          {profile.website_url && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary hover:underline"
              >
                {profile.website_url.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
