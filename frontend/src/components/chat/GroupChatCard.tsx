import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSidebar } from "@/components/ui/sidebar";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages } =
    useChatStore();
  const { setOpenMobile, isMobile } = useSidebar();

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user._id] || 0;
  const name = convo.group?.name || "Nhóm trò chuyện";

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (isMobile) {
      setOpenMobile(false);
    }
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  const memberCountText = `${convo.participants.length} thành viên`;
  const lastMessageText = convo.lastMessage?.content
    ? convo.lastMessage.content
    : memberCountText;

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <GroupChatAvatar
          participants={convo.participants}
          type="sidebar"
        />
      }
      subtitle={lastMessageText}
    />
  );
};

export default GroupChatCard;
