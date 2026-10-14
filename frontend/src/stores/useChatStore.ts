import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false, // convo loading
      messageLoading: false,
      loading: false,
      typingUsers: {},

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
          typingUsers: {},
        });
      },
      setTyping: (conversationId, userId, isTyping) => {
        set((state) => {
          const current = state.typingUsers[conversationId] || [];
          const updated = isTyping
            ? Array.from(new Set([...current, userId]))
            : current.filter((id) => id !== userId);
          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: updated,
            },
          };
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations:", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged = prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (
        recipientId,
        content,
        imgUrl,
        replyTo,
        fileData
      ) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            replyTo,
            fileData
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (
        conversationId,
        content,
        imgUrl,
        replyTo,
        fileData
      ) => {
        try {
          await chatService.sendGroupMessage(
            conversationId,
            content,
            imgUrl,
            replyTo,
            fileData
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra gửi group message", error);
        }
      },
      deleteMessage: async (messageId) => {
        try {
          await chatService.deleteMessage(messageId);
        } catch (error) {
          console.error("Lỗi xảy ra khi thu hồi tin nhắn:", error);
          throw error;
        }
      },
      editMessage: async (messageId, content) => {
        try {
          await chatService.editMessage(messageId, content);
        } catch (error) {
          console.error("Lỗi xảy ra khi chỉnh sửa tin nhắn:", error);
          throw error;
        }
      },
      updateMessageInState: (message) => {
        const { user } = useAuthStore.getState();
        message.isOwn = message.senderId === user?._id;
        const convoId = message.conversationId;

        set((state) => {
          const convoMessages = state.messages[convoId];
          if (!convoMessages) return state;

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...convoMessages,
                items: convoMessages.items.map((m) =>
                  m._id === message._id ? { ...m, ...message } : m
                ),
              },
            },
            conversations: state.conversations.map((c) =>
              c._id === convoId && c.lastMessage?._id === message._id
                ? {
                    ...c,
                    lastMessage: {
                      ...c.lastMessage,
                      content: message.content || "",
                    },
                  }
                : c
            ),
          };
        });
      },
      removeMessageFromState: (messageId, conversationId) => {
        set((state) => {
          const convoMessages = state.messages[conversationId];
          if (!convoMessages) return state;

          return {
            messages: {
              ...state.messages,
              [conversationId]: {
                ...convoMessages,
                items: convoMessages.items.map((m) =>
                  m._id === messageId
                    ? {
                        ...m,
                        isDeleted: true,
                        content: "Tin nhắn đã được thu hồi",
                        imgUrl: null,
                      }
                    : m
                ),
              },
            },
            conversations: state.conversations.map((c) =>
              c._id === conversationId && c.lastMessage?._id === messageId
                ? {
                    ...c,
                    lastMessage: {
                      ...c.lastMessage,
                      content: "Tin nhắn đã được thu hồi",
                    },
                  }
                : c
            ),
          };
        });
      },
      addMembersToGroup: async (conversationId, memberIds) => {
        try {
          const updated = await chatService.addMembersToGroup(
            conversationId,
            memberIds
          );
          get().updateConversation(updated);
        } catch (error) {
          console.error("Lỗi khi thêm thành viên nhóm:", error);
          throw error;
        }
      },
      removeMemberFromGroup: async (conversationId, memberId) => {
        try {
          const updated = await chatService.removeMemberFromGroup(
            conversationId,
            memberId
          );
          get().updateConversation(updated);
        } catch (error) {
          console.error("Lỗi khi xoá thành viên:", error);
          throw error;
        }
      },
      updateGroupInfo: async (conversationId, name) => {
        try {
          const updated = await chatService.updateGroupInfo(
            conversationId,
            name
          );
          get().updateConversation(updated);
        } catch (error) {
          console.error("Lỗi khi đổi tên nhóm:", error);
          throw error;
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId]?.hasMore ?? false,
                  nextCursor: state.messages[convoId]?.nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy khi ra add message:", error);
        }
      },
      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find((c) => c._id === activeConversationId);

          if (!convo) {
            return;
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }

          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi markAsSeen trong store", error);
        }
      },
      addConvo: (convo) => {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString()
          );

          return {
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds
          );

          get().addConvo(conversation);

          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi createConversation trong store", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
