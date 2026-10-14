import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";

import { GroupManagementModal } from "./GroupManagementModal";
import { MessageSearchModal } from "./MessageSearchModal";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();

  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) return;
  }

  const isOnline = onlineUsers.includes(otherUser?._id ?? "");

  return (
    <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background border-b border-border/40">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-foreground" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          <div className="p-1 flex items-center gap-3">
            {/* avatar */}
            <div className="relative">
              {chat.type === "direct" ? (
                <>
                  <UserAvatar
                    type={"sidebar"}
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

            {/* name & status */}
            <div>
              <h2 className="font-semibold text-foreground text-sm">
                {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {chat.type === "direct"
                  ? isOnline
                    ? "Đang trực tuyến"
                    : "Ngoại tuyến"
                  : `${chat.participants.length} thành viên`}
              </p>
            </div>
          </div>
        </div>

        {/* Nút tác vụ (Tìm kiếm + Cài đặt nhóm) */}
        <div className="flex items-center gap-1">
          <MessageSearchModal conversationId={chat._id} />
          {chat.type === "group" && <GroupManagementModal chat={chat} />}
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
