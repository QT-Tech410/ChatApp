import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import { useSocketStore } from "@/stores/useSocketStore";
import { useSidebar } from "@/components/ui/sidebar";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages } =
    useChatStore();
  const { onlineUsers } = useSocketStore();
  const { setOpenMobile, isMobile } = useSidebar();

  if (!user) return null;

  const otherUser = convo.participants.find((p) => p._id !== user._id);
  if (!otherUser) return null;

  const unreadCount = convo.unreadCounts[user._id] || 0;
  const lastMessage = convo.lastMessage?.content ?? "Chưa có tin nhắn";

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (isMobile) {
      setOpenMobile(false);
    }
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={otherUser.displayName ?? ""}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          <UserAvatar
            type="sidebar"
            name={otherUser.displayName ?? ""}
            avatarUrl={otherUser.avatarUrl ?? undefined}
          />
          <StatusBadge
            status={
              onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"
            }
          />
        </>
      }
      subtitle={lastMessage}
    />
  );
};

export default DirectMessageCard;
