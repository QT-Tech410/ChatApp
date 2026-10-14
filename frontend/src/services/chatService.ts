import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    const query = cursor
      ? `?limit=${pageLimit}&cursor=${encodeURIComponent(cursor)}`
      : `?limit=${pageLimit}`;
    const res = await api.get(`/conversations/${id}/messages${query}`);

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async uploadMessageImage(formData: FormData) {
    const res = await api.post("/messages/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 400) {
      throw new Error(res.data.message);
    }

    return res.data.imgUrl as string;
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
    replyTo?: string,
    fileData?: { fileUrl?: string; fileName?: string; fileType?: string },
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
      replyTo,
      ...fileData,
    });

    return res.data.message;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
    replyTo?: string,
    fileData?: { fileUrl?: string; fileName?: string; fileType?: string },
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
      replyTo,
      ...fileData,
    });
    return res.data.message;
  },

  async searchMessages(conversationId: string, q: string) {
    const res = await api.get(
      `/conversations/${conversationId}/messages/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  },

  async getUploadSignature() {
    const res = await api.get("/messages/upload-signature");
    return res.data;
  },

  async deleteMessage(messageId: string) {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
  },

  async editMessage(messageId: string, content: string) {
    const res = await api.patch(`/messages/${messageId}`, { content });
    return res.data;
  },

  async addMembersToGroup(conversationId: string, memberIds: string[]) {
    const res = await api.post(`/conversations/${conversationId}/members`, {
      memberIds,
    });
    return res.data.conversation;
  },

  async removeMemberFromGroup(conversationId: string, memberId: string) {
    const res = await api.delete(
      `/conversations/${conversationId}/members/${memberId}`
    );
    return res.data.conversation;
  },

  async updateGroupInfo(conversationId: string, name: string) {
    const res = await api.patch(`/conversations/${conversationId}/group`, {
      name,
    });
    return res.data.conversation;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },
};
