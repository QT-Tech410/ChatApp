import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import Conversation from "../models/Conversation.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// {userId: Set<socketId>} — một user có thể có nhiều socket (nhiều tab/thiết bị).
// Trước đây Map lưu {userId: socketId}: mở tab thứ hai ghi đè tab thứ nhất,
// và đóng tab thứ nhất sẽ xoá luôn user khỏi danh sách online dù tab hai vẫn mở.
const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  // console.log(`${user.displayName} online với socket ${socket.id}`);

  const sockets = onlineUsers.get(userId);
  const wasAlreadyOnline = sockets !== undefined;

  if (sockets) {
    sockets.add(socket.id);
  } else {
    onlineUsers.set(userId, new Set([socket.id]));
  }

  // chỉ broadcast khi user chuyển trạng thái offline -> online
  if (!wasAlreadyOnline) {
    io.emit("online-users", Array.from(onlineUsers.keys()));
  }

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  // Chỉ cho join room của conversation mà user THỰC SỰ là thành viên.
  // Không verify ở đây thì bất kỳ user nào cũng emit "join-conversation"
  // với một conversationId đoán được và nhận real-time toàn bộ tin nhắn
  // của người khác (IDOR qua socket).
  socket.on("join-conversation", async (conversationId, ack) => {
    try {
      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) {
        return ack?.({ ok: false, message: "conversationId không hợp lệ" });
      }

      const conversation = await Conversation.findOne(
        { _id: conversationId, "participants.userId": user._id },
        { _id: 1 },
      ).lean();

      if (!conversation) {
        return ack?.({
          ok: false,
          message: "Không có quyền tham gia conversation này",
        });
      }

      socket.join(conversationId);
      ack?.({ ok: true });
    } catch (error) {
      console.error("Lỗi khi join-conversation:", error);
      ack?.({ ok: false, message: "Lỗi hệ thống" });
    }
  });

  socket.join(userId);

  socket.on("disconnect", () => {
    const remaining = onlineUsers.get(userId);
    if (!remaining) return;

    remaining.delete(socket.id);

    // chỉ đánh dấu offline khi socket cuối cùng của user đóng
    if (remaining.size === 0) {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
    /* console.log(`socket disconnected: ${socket.id}`); */
  });
});

export { io, app, server };
