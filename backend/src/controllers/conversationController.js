import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { findOrCreateDirectConversation } from "../utils/conversationHelper.js";
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await findOrCreateDirectConversation(userId, participantId);
    }

    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    if (!conversation) {
      return res.status(400).json({ message: "Conversation type không hợp lệ" });
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      {
        path: "seenBy",
        select: "displayName avatarUrl",
      },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    if (type === "group") {
      memberIds.forEach((userId) => {
        io.to(userId).emit("new-group", formatted);
      });
    }

    if (type === "direct") {
      io.to(userId).emit("new-group", formatted);
      io.to(memberIds[0]).emit("new-group", formatted);
    }

    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy conversations", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { cursor } = req.query;

    // Cap limit từ client: chặn ?limit=999999 làm sập server
    const requested = Number(req.query.limit);
    const limit = Number.isFinite(requested)
      ? Math.min(Math.max(Math.floor(requested), 1), 100)
      : 50;

    const query = { conversationId };

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (Number.isNaN(cursorDate.getTime())) {
        return res.status(400).json({ message: "cursor không hợp lệ" });
      }
      query.createdAt = { $lt: cursorDate };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: "replyTo",
        select: "content senderId imgUrl isDeleted createdAt",
        populate: { path: "senderId", select: "displayName avatarUrl" },
      })
      .lean();

    let nextCursor = null;

    if (messages.length > limit) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy messages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    // conversation đã được checkConversationMember nạp sẵn (đã verify membership)
    const conversation = req.conversation;

    const last = conversation.lastMessage;

    if (!last) {
      return res.status(200).json({ message: "Không có tin nhắn để mark as seen" });
    }

    if (last.senderId?.toString() === userId) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }

    // cập nhật bằng $addToSet/$set có đường dẫn thay vì save() cả document
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage?._id,
        content: updated?.lastMessage?.content,
        createdAt: updated?.lastMessage?.createdAt,
        sender: {
          _id: updated?.lastMessage?.senderId,
        },
      },
    });

    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts?.get?.(userId) ?? updated?.unreadCounts?.[userId] ?? 0,
    });
  } catch (error) {
    console.error("Lỗi khi mark as seen", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const addMembersToGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { memberIds } = req.body;
    const conversation = req.conversation;

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ nhóm chat mới có thể thêm thành viên" });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "Danh sách memberIds không hợp lệ" });
    }

    const currentMemberIds = new Set(
      conversation.participants.map((p) => p.userId.toString())
    );

    const newMemberIds = memberIds.filter(
      (id) => typeof id === "string" && !currentMemberIds.has(id)
    );

    if (newMemberIds.length === 0) {
      return res.status(400).json({ message: "Tất cả người dùng đã có trong nhóm" });
    }

    newMemberIds.forEach((id) => {
      conversation.participants.push({ userId: id, joinedAt: new Date() });
    });

    await conversation.save();

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    // Emit socket cho tất cả thành viên trong nhóm và cho các thành viên mới
    io.to(conversationId).emit("group-updated", formatted);
    newMemberIds.forEach((userId) => {
      io.to(userId).emit("new-group", formatted);
    });

    return res.status(200).json({
      message: "Thêm thành viên thành công",
      conversation: formatted,
    });
  } catch (error) {
    console.error("Lỗi khi thêm thành viên nhóm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { conversationId, memberId } = req.params;
    const callerId = req.user._id.toString();
    const conversation = req.conversation;

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ nhóm chat mới có thể xoá thành viên" });
    }

    const isSelfLeaving = callerId === memberId;
    const isCreator = conversation.group?.createdBy?.toString() === callerId;

    if (!isSelfLeaving && !isCreator) {
      return res.status(403).json({
        message: "Chỉ trưởng nhóm mới có quyền xoá thành viên khác",
      });
    }

    const initialLength = conversation.participants.length;
    conversation.participants = conversation.participants.filter(
      (p) => p.userId.toString() !== memberId
    );

    if (conversation.participants.length === initialLength) {
      return res.status(404).json({ message: "Thành viên không tồn tại trong nhóm" });
    }

    // Nếu trưởng nhóm rời nhóm, chuyển quyền cho thành viên tiếp theo
    if (isCreator && isSelfLeaving && conversation.participants.length > 0) {
      conversation.group.createdBy = conversation.participants[0].userId;
    }

    await conversation.save();

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    io.to(conversationId).emit("group-updated", formatted);
    io.to(memberId).emit("removed-from-group", { conversationId });

    return res.status(200).json({
      message: isSelfLeaving ? "Đã rời nhóm thành công" : "Đã xoá thành viên khỏi nhóm",
      conversation: formatted,
    });
  } catch (error) {
    console.error("Lỗi khi xoá/rời nhóm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateGroupInfo = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name } = req.body;
    const conversation = req.conversation;

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ nhóm chat mới có thể cập nhật thông tin" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }

    conversation.group.name = name.trim();
    await conversation.save();

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    io.to(conversationId).emit("group-updated", formatted);

    return res.status(200).json({
      message: "Cập nhật thông tin nhóm thành công",
      conversation: formatted,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin nhóm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
