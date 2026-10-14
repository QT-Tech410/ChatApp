import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { findOrCreateDirectConversation } from "../utils/conversationHelper.js";
import { io } from "../socket/index.js";
import { cacheService } from "../services/cacheService.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, imgUrl, conversationId, replyTo } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content && !imgUrl) {
      return res.status(400).json({ message: "Thiếu nội dung hoặc ảnh" });
    }

    if (!recipientId) {
      return res.status(400).json({ message: "Thiếu recipientId" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);

      // Chống IDOR: conversation truyền lên từ client phải thật sự là
      // direct conversation giữa sender và recipient.
      if (conversation) {
        const isDirect = conversation.type === "direct";
        const memberIds = conversation.participants.map((p) =>
          p.userId.toString()
        );
        const includesBoth =
          memberIds.includes(senderId.toString()) &&
          memberIds.includes(recipientId.toString());

        if (!isDirect || !includesBoth) {
          return res.status(403).json({
            message: "Conversation không hợp lệ cho tin nhắn này",
          });
        }
      }
    }

    if (!conversation) {
      conversation = await findOrCreateDirectConversation(senderId, recipientId);
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content: content || "",
      imgUrl,
      replyTo: replyTo && mongoose.Types.ObjectId.isValid(replyTo) ? replyTo : null,
    });

    if (message.replyTo) {
      await message.populate({
        path: "replyTo",
        select: "content senderId imgUrl isDeleted createdAt",
        populate: { path: "senderId", select: "displayName avatarUrl" },
      });
    }

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    await cacheService.invalidateConversation(
      conversation._id,
      conversation.participants.map((p) => p.userId)
    );

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, imgUrl, replyTo } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content && !imgUrl) {
      return res.status(400).json({ message: "Thiếu nội dung hoặc ảnh" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: content || "",
      imgUrl,
      replyTo: replyTo && mongoose.Types.ObjectId.isValid(replyTo) ? replyTo : null,
    });

    if (message.replyTo) {
      await message.populate({
        path: "replyTo",
        select: "content senderId imgUrl isDeleted createdAt",
        populate: { path: "senderId", select: "displayName avatarUrl" },
      });
    }

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    await cacheService.invalidateConversation(
      conversation._id,
      conversation.participants.map((p) => p.userId)
    );

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "messageId không hợp lệ" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    if (message.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể thu hồi tin nhắn của chính mình" });
    }

    message.isDeleted = true;
    message.content = "Tin nhắn đã được thu hồi";
    message.imgUrl = null;
    await message.save();

    // Cập nhật lastMessage của conversation nếu là tin nhắn cuối cùng
    const conversation = await Conversation.findById(message.conversationId);
    if (
      conversation &&
      conversation.lastMessage &&
      conversation.lastMessage._id?.toString() === message._id.toString()
    ) {
      conversation.lastMessage.content = "Tin nhắn đã được thu hồi";
      await conversation.save();
    }

    io.to(message.conversationId.toString()).emit("message-deleted", {
      messageId: message._id.toString(),
      conversationId: message.conversationId.toString(),
      content: message.content,
    });

    await cacheService.invalidateConversation(
      message.conversationId,
      conversation?.participants?.map((p) => p.userId) || []
    );

    return res.status(200).json({
      message: "Thu hồi tin nhắn thành công",
      deletedMessage: message,
    });
  } catch (error) {
    console.error("Lỗi khi thu hồi tin nhắn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "messageId không hợp lệ" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung tin nhắn không được để trống" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    if (message.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình" });
    }

    if (message.isDeleted) {
      return res
        .status(400)
        .json({ message: "Không thể chỉnh sửa tin nhắn đã bị thu hồi" });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    // Cập nhật lastMessage nếu là tin cuối
    const conversation = await Conversation.findById(message.conversationId);
    if (
      conversation &&
      conversation.lastMessage &&
      conversation.lastMessage._id?.toString() === message._id.toString()
    ) {
      conversation.lastMessage.content = message.content;
      await conversation.save();
    }

    io.to(message.conversationId.toString()).emit("message-edited", {
      message,
    });

    await cacheService.invalidateConversation(
      message.conversationId,
      conversation?.participants?.map((p) => p.userId) || []
    );

    return res.status(200).json({
      message: "Chỉnh sửa tin nhắn thành công",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadMessageImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadImageFromBuffer(file.buffer, {
      folder: "chat_app/messages",
      transformation: [{ quality: "auto" }],
    });

    return res.status(200).json({ imgUrl: result.secure_url });
  } catch (error) {
    console.error("Lỗi xảy ra khi upload ảnh tin nhắn", error);
    return res.status(500).json({ message: "Upload ảnh thất bại" });
  }
};
