import type { User } from "@/types/user";
import { Card, CardContent } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/useSocketStore";
import AvatarUploader from "./AvatarUploader";

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { onlineUsers } = useSocketStore();
  if (!user) return null;

  const isOnline = onlineUsers.includes(user._id);

  return (
    <Card className="overflow-hidden p-0 border border-border shadow-sm rounded-2xl bg-card">
      {/* Cover Header */}
      <div className="h-28 w-full bg-muted border-b border-border/50 relative" />

      {/* Profile Details */}
      <CardContent className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
        <div className="relative shrink-0">
          <UserAvatar
            type="profile"
            name={user.displayName}
            avatarUrl={user.avatarUrl ?? undefined}
            className="ring-4 ring-card shadow-md"
          />
          <AvatarUploader />
        </div>

        {/* User Info */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-foreground truncate">
              {user.displayName}
            </h2>
            <span className="text-xs text-muted-foreground">
              @{user.username}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1 max-w-lg line-clamp-2">
            {user.bio || "Người dùng ChatApp"}
          </p>
        </div>

        {/* Status Indicator */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 select-none",
            isOnline
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border/60"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isOnline ? "bg-emerald-500" : "bg-muted-foreground"
            )}
          />
          <span>{isOnline ? "Trực tuyến" : "Ngoại tuyến"}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
