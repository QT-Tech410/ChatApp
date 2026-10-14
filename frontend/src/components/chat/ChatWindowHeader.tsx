import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

import { GroupManagementModal } from "./GroupManagementModal";
import { MessageSearchModal } from "./MessageSearchModal";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const { isMobile, setOpenMobile } = useSidebar();

  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 h-14 w-full border-b border-border/60 bg-background">
        <SidebarTrigger className="text-foreground hover:bg-muted" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) return null;
  }

  const isOnline = onlineUsers.includes(otherUser?._id ?? "");

  const handleBackToConversations = () => {
    setActiveConversation(null);
    if (isMobile) {
      setOpenMobile(true);
    }
  };

  return (
    <header className="sticky top-0 z-10 px-4 h-14 flex items-center bg-background border-b border-border/60 shrink-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Back Button */}
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBackToConversations}
              className="mr-1 text-foreground hover:bg-muted"
              title="Quay lại danh sách hội thoại"
              aria-label="Quay lại danh sách hội thoại"
            >
              <ChevronLeft className="size-5" />
            </Button>
          ) : (
            <>
              <SidebarTrigger className="-ml-1 text-foreground hover:bg-muted" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </>
          )}

          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              {chat.type === "direct" ? (
                <>
                  <UserAvatar
                    type="sidebar"
                    name={otherUser?.displayName || "ChatApp"}
                    avatarUrl={otherUser?.avatarUrl || undefined}
                  />
                  <StatusBadge status={isOnline ? "online" : "offline"} />
                </>
              ) : (
                <GroupChatAvatar
                  participants={chat.participants}
                  type="sidebar"
                />
              )}
            </div>

            {/* Name & Status */}
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground text-sm truncate">
                {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {chat.type === "direct"
                  ? isOnline
                    ? "Đang trực tuyến"
                    : "Ngoại tuyến"
                  : `${chat.participants.length} thành viên`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Search + Group Settings) */}
        <div className="flex items-center gap-1 shrink-0">
          <MessageSearchModal conversationId={chat._id} />
          {chat.type === "group" && <GroupManagementModal chat={chat} />}
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
