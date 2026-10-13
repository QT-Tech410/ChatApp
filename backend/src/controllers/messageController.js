import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { findOrCreateDirectConversation } from "../utils/conversationHelper.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, imgUrl, conversationId } = req.body;
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
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, imgUrl } = req.body;
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
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
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
