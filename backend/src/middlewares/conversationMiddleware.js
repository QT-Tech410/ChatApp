import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";

// Bảo vệ mọi route thao tác theo :conversationId (đọc tin nhắn, mark as seen...).
// Ngăn IDOR: user chỉ truy cập được conversation mà chính họ là thành viên.
// Sau khi pass, conversation được gắn vào req.conversation để controller tái sử dụng
// (tránh query DB lần hai).
export const checkConversationMember = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "conversationId không hợp lệ" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập cuộc trò chuyện này" });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("Lỗi checkConversationMember:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
