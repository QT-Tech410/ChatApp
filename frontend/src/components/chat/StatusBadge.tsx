import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline";
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const isOnline = status === "online";
  return (
    <span
      className={cn(
        "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background shrink-0 select-none",
        isOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600",
        className
      )}
      title={isOnline ? "Trực tuyến" : "Ngoại tuyến"}
      aria-label={isOnline ? "Trực tuyến" : "Ngoại tuyến"}
    />
  );
};

export default StatusBadge;
