import { SidebarInset } from "../ui/sidebar";

const ChatWindowSkeleton = () => {
  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden bg-background">
      {/* Mock Header */}
      <div className="h-14 px-4 py-2 border-b border-border/50 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-muted rounded" />
            <div className="h-2.5 w-16 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-muted" />
          <div className="size-8 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Mock Message Stream */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden animate-pulse">
        {/* Received message */}
        <div className="flex gap-2 items-end">
          <div className="size-7 rounded-full bg-muted shrink-0" />
          <div className="space-y-1 max-w-xs">
            <div className="h-10 w-48 rounded-2xl rounded-bl-xs bg-muted/60" />
            <div className="h-2 w-10 bg-muted/40 rounded" />
          </div>
        </div>

        {/* Sent message */}
        <div className="flex justify-end">
          <div className="space-y-1 max-w-xs flex flex-col items-end">
            <div className="h-14 w-60 rounded-2xl rounded-br-xs bg-primary/20" />
            <div className="h-2 w-12 bg-muted/40 rounded" />
          </div>
        </div>

        {/* Received message */}
        <div className="flex gap-2 items-end">
          <div className="size-7 rounded-full bg-muted shrink-0" />
          <div className="space-y-1 max-w-xs">
            <div className="h-16 w-64 rounded-2xl rounded-bl-xs bg-muted/60" />
            <div className="h-2 w-10 bg-muted/40 rounded" />
          </div>
        </div>

        {/* Sent message */}
        <div className="flex justify-end">
          <div className="space-y-1 max-w-xs flex flex-col items-end">
            <div className="h-9 w-36 rounded-2xl rounded-br-xs bg-primary/20" />
            <div className="h-2 w-10 bg-muted/40 rounded" />
          </div>
        </div>
      </div>

      {/* Mock Footer Input */}
      <div className="p-3 border-t border-border/50 flex items-center gap-2 animate-pulse">
        <div className="size-9 rounded-lg bg-muted shrink-0" />
        <div className="size-9 rounded-lg bg-muted shrink-0" />
        <div className="h-9 flex-1 rounded-lg bg-muted/50" />
        <div className="size-9 rounded-lg bg-primary/30 shrink-0" />
      </div>
    </SidebarInset>
  );
};

export default ChatWindowSkeleton;
