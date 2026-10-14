const ConversationSkeleton = () => {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2.5 rounded-lg animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="size-10 rounded-full bg-muted shrink-0" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 w-1/3 bg-muted rounded" />
              <div className="h-2.5 w-8 bg-muted/60 rounded shrink-0" />
            </div>
            <div className="h-3 w-2/3 bg-muted/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationSkeleton;
