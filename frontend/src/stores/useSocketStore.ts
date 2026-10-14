import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (useChatStore.getState().activeConversationId === message.conversationId) {
        useChatStore.getState().markAsSeen();
      }

      useChatStore.getState().updateConversation(updatedConversation);
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // message deleted (recalled)
    socket.on("message-deleted", ({ messageId, conversationId }) => {
      useChatStore.getState().removeMessageFromState(messageId, conversationId);
    });

    // message edited
    socket.on("message-edited", ({ message }) => {
      useChatStore.getState().updateMessageInState(message);
    });

    // typing indicators
    socket.on("user-typing", ({ conversationId, userId }) => {
      useChatStore.getState().setTyping(conversationId, userId, true);
    });

    socket.on("user-stop-typing", ({ conversationId, userId }) => {
      useChatStore.getState().setTyping(conversationId, userId, false);
    });

    // group updated
    socket.on("group-updated", (conversation) => {
      useChatStore.getState().updateConversation(conversation);
    });

    // removed from group
    socket.on("removed-from-group", ({ conversationId }) => {
      const { conversations, activeConversationId } = useChatStore.getState();
      useChatStore.setState({
        conversations: conversations.filter((c) => c._id !== conversationId),
        activeConversationId:
          activeConversationId === conversationId ? null : activeConversationId,
      });
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
