import type { FriendRequest } from "@/types/user";
import type { ReactNode } from "react";
import UserAvatar from "../chat/UserAvatar";

interface RequestItemProps {
  requestInfo: FriendRequest;
  actions: ReactNode;
  type: "sent" | "received";
}

const FriendRequestItem = ({ requestInfo, actions, type }: RequestItemProps) => {
  if (!requestInfo) {
    return null;
  }
  const info = type === "sent" ? requestInfo.to : requestInfo.from;

  if (!info) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 p-3 bg-card shadow-2xs">
      <div className="flex items-start gap-3 min-w-0">
        <UserAvatar
          type="sidebar"
          name={info.displayName}
          avatarUrl={info.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">
            {info.displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{info.username}
          </p>
          {requestInfo.message && (
            <p className="text-xs text-foreground/80 bg-muted/50 p-1.5 rounded-md mt-1 italic border border-border/40">
              "{requestInfo.message}"
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-end">{actions}</div>
    </div>
  );
};

export default FriendRequestItem;
