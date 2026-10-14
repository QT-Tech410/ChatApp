import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile" | "sm";
  name?: string;
  avatarUrl?: string;
  className?: string;
}

const AVATAR_COLORS = [
  "bg-indigo-600 text-white",
  "bg-blue-600 text-white",
  "bg-teal-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
  "bg-violet-600 text-white",
  "bg-slate-700 text-white",
];

export function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  if (!name) return "C";
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  const displayName = name?.trim() || "ChatApp";
  const colorClass = getAvatarColor(displayName);
  const initials = getInitials(displayName);

  return (
    <Avatar
      className={cn(
        "shrink-0 select-none",
        type === "sidebar" && "size-10 text-sm font-medium",
        type === "chat" && "size-8 text-xs font-medium",
        type === "sm" && "size-7 text-xs font-medium",
        type === "profile" && "size-20 text-2xl font-semibold shadow-sm",
        className
      )}
    >
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={displayName}
          className="object-cover"
        />
      )}
      <AvatarFallback className={cn("font-medium", colorClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
