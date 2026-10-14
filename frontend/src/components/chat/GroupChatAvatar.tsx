import type { Participant } from "@/types/chat";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "./UserAvatar";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
  className?: string;
}

const GroupChatAvatar = ({ participants = [], type, className }: GroupChatAvatarProps) => {
  const isSidebar = type === "sidebar";
  const containerSize = isSidebar ? "size-10" : "size-8";

  // Nếu không có hoặc chỉ có 1 thành viên
  if (!participants || participants.length === 0) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-border/50",
          containerSize,
          className
        )}
      >
        <Users className={isSidebar ? "size-5" : "size-4"} />
      </div>
    );
  }

  // 2 thành viên: 2 avatar so le trong 1 vòng tròn
  if (participants.length === 2) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-muted/60 shrink-0 border border-border/50",
          containerSize,
          className
        )}
      >
        {participants.slice(0, 2).map((member, index) => {
          const color = getAvatarColor(member.displayName || "User");
          const initial = getInitials(member.displayName || "U");
          const position =
            index === 0
              ? "absolute top-0 left-0 size-6"
              : "absolute bottom-0 right-0 size-6 ring-2 ring-background";

          return (
            <div
              key={member._id || index}
              className={cn(
                "rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden",
                color,
                position
              )}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="size-full object-cover"
                />
              ) : (
                initial.slice(0, 1)
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 3 hoặc nhiều hơn: Lưới 2x2 gọn gàng trong 1 khung tròn
  const displayMembers = participants.slice(0, 3);
  const remainingCount = participants.length - 3;

  return (
    <div
      className={cn(
        "grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 rounded-full overflow-hidden bg-muted/50 shrink-0 border border-border/50",
        containerSize,
        className
      )}
    >
      {displayMembers.map((member, index) => {
        const color = getAvatarColor(member.displayName || "User");
        const initial = getInitials(member.displayName || "U");

        return (
          <div
            key={member._id || index}
            className={cn(
              "rounded-full flex items-center justify-center text-[9px] font-medium overflow-hidden leading-none",
              color
            )}
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.displayName}
                className="size-full object-cover"
              />
            ) : (
              initial.slice(0, 1)
            )}
          </div>
        );
      })}

      {/* Ô thứ 4: Nếu còn thành viên thì hiện +N, nếu đúng 4 thì hiện member thứ 4 */}
      {remainingCount > 0 ? (
        <div className="rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground leading-none">
          +{remainingCount}
        </div>
      ) : participants[3] ? (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-[9px] font-medium overflow-hidden leading-none",
            getAvatarColor(participants[3].displayName || "User")
          )}
        >
          {participants[3].avatarUrl ? (
            <img
              src={participants[3].avatarUrl}
              alt={participants[3].displayName}
              className="size-full object-cover"
            />
          ) : (
            getInitials(participants[3].displayName || "U").slice(0, 1)
          )}
        </div>
      ) : (
        <div className="rounded-full bg-muted/30" />
      )}
    </div>
  );
};

export default GroupChatAvatar;
