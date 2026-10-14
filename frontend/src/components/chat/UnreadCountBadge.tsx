import { cn } from "@/lib/utils";

interface UnreadCountBadgeProps {
  unreadCount: number;
  className?: string;
}

const UnreadCountBadge = ({ unreadCount, className }: UnreadCountBadgeProps) => {
  if (unreadCount <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold leading-none text-white bg-primary rounded-full shadow-xs shrink-0 select-none",
        className
      )}
      aria-label={`${unreadCount} tin nhắn chưa đọc`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default UnreadCountBadge;
