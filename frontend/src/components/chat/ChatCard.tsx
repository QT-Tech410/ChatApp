import { formatOnlineTime, cn } from "@/lib/utils";
import UnreadCountBadge from "./UnreadCountBadge";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount = 0,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  const hasUnread = unreadCount > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      key={convoId}
      className={cn(
        "group relative flex items-center gap-3 w-full p-2.5 rounded-lg cursor-pointer transition-colors duration-150 select-none outline-none text-left",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isActive
          ? "bg-muted text-foreground font-medium shadow-2xs"
          : "hover:bg-muted/50 text-foreground/90"
      )}
      onClick={() => onSelect(convoId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(convoId);
        }
      }}
    >
      {/* Active Indicator Bar on the left */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r" />
      )}

      {/* Avatar + Status section */}
      <div className="relative shrink-0">{leftSection}</div>

      {/* Name, Time, Subtitle, Unread Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-0.5">
          <h3
            className={cn(
              "text-sm truncate",
              isActive || hasUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/90"
            )}
          >
            {name}
          </h3>

          {timestamp && (
            <span
              className={cn(
                "text-[11px] shrink-0 tabular-nums",
                hasUnread ? "font-medium text-primary" : "text-muted-foreground"
              )}
            >
              {formatOnlineTime(timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex-1 min-w-0 text-xs truncate",
              hasUnread
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {subtitle}
          </div>

          {hasUnread && <UnreadCountBadge unreadCount={unreadCount} />}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
