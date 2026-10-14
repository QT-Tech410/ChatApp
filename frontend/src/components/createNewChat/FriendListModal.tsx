import { useFriendStore } from "@/stores/useFriendStore";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { MessageSquarePlus, Users } from "lucide-react";
import UserAvatar from "../chat/UserAvatar";
import { useChatStore } from "@/stores/useChatStore";

interface FriendListModalProps {
  onSelect?: () => void;
}

const FriendListModal = ({ onSelect }: FriendListModalProps) => {
  const { friends } = useFriendStore();
  const { createConversation } = useChatStore();

  const handleAddConversation = async (friendId: string) => {
    try {
      await createConversation("direct", "", [friendId]);
      onSelect?.();
    } catch (error) {
      console.error("Lỗi tạo hội thoại:", error);
    }
  };

  return (
    <DialogContent className="max-w-md p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquarePlus className="size-5 text-primary" />
          Bắt đầu hội thoại mới
        </DialogTitle>
      </DialogHeader>

      {/* Friends list */}
      <div className="space-y-3 mt-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Danh sách bạn bè ({friends.length})
        </h3>

        <div className="space-y-1.5 max-h-72 overflow-y-auto beautiful-scrollbar pr-1">
          {friends.map((friend) => (
            <div
              role="button"
              tabIndex={0}
              key={friend._id}
              onClick={() => handleAddConversation(friend._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAddConversation(friend._id);
                }
              }}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <UserAvatar
                type="sidebar"
                name={friend.displayName}
                avatarUrl={friend.avatarUrl}
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {friend.displayName}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  @{friend.username}
                </p>
              </div>
            </div>
          ))}

          {friends.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="size-10 mx-auto mb-2.5 opacity-40" />
              <p className="text-sm font-medium">Chưa có bạn bè trong danh sách</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Hãy thêm bạn mới để bắt đầu cuộc trò chuyện.
              </p>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default FriendListModal;
