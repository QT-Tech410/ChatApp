import Conversation from "../models/Conversation.js";

const directKeyOf = (a, b) => [a.toString(), b.toString()].sort().join("_");

// Tìm conversation direct của cặp (a, b); tạo mới nếu chưa có.
// An toàn với race condition: unique index trên directKey khiến request thua
// nhận lỗi E11000 thay vì tạo ra conversation trùng — khi đó ta query lại
// conversation mà request thắng vừa tạo và dùng nó.
export const findOrCreateDirectConversation = async (userId, otherId) => {
  const key = directKeyOf(userId, otherId);

  const existing = await Conversation.findOne({
    type: "direct",
    directKey: key,
  });

  if (existing) return existing;

  // Fallback cho dữ liệu cũ: conversation tạo trước khi field directKey tồn tại
  // chưa có key nên tra cứu ở trên không thấy. Tìm lại theo cặp participant để
  // tránh tạo conversation trùng, rồi backfill directKey cho nó.
  const legacy = await Conversation.findOne({
    type: "direct",
    "participants.userId": { $all: [userId, otherId] },
  });

  if (legacy) {
    if (!legacy.directKey) {
      legacy.directKey = key;
      await legacy.save().catch(() => {});
    }
    return legacy;
  }

  try {
    return await Conversation.create({
      type: "direct",
      participants: [
        { userId, joinedAt: new Date() },
        { userId: otherId, joinedAt: new Date() },
      ],
      lastMessageAt: new Date(),
      unreadCounts: new Map(),
    });
  } catch (error) {
    if (error.code !== 11000) throw error;

    // thua race: lấy conversation vừa được tạo bởi request kia
    const winner = await Conversation.findOne({
      type: "direct",
      directKey: key,
    });

    if (!winner) throw error;
    return winner;
  }
};
