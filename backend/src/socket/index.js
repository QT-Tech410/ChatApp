import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import Conversation from "../models/Conversation.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";
import { pubClient, subClient } from "../libs/redis.js";
import { cacheService } from "../services/cacheService.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Kích hoạt Redis Adapter khi pub/sub client sẵn sàng
if (pubClient && subClient) {
  pubClient.on("ready", () => {
    try {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("[Socket.io] Đã kích hoạt Redis Adapter cho Cluster đa server");
    } catch (err) {
      console.warn("[Socket.io] Lỗi gắn Redis Adapter:", err.message);
    }
  });
}

io.use(socketAuthMiddleware);

io.on("connection", async (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  // Đăng ký socket vào cache presence (hỗ trợ đa server & nhiều thiết bị)
  await cacheService.addOnlineSocket(userId, socket.id);
  const onlineList = await cacheService.getAllOnlineUsers();
  io.emit("online-users", onlineList);

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  // Chỉ cho join room của conversation mà user THỰC SỰ là thành viên (chống IDOR)
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

  socket.on("typing", ({ conversationId }) => {
    if (conversationId) {
      socket.to(conversationId).emit("user-typing", {
        conversationId,
        userId,
      });
    }
  });

  socket.on("stop-typing", ({ conversationId }) => {
    if (conversationId) {
      socket.to(conversationId).emit("user-stop-typing", {
        conversationId,
        userId,
      });
    }
  });

  socket.on("disconnect", async () => {
    const isCompletelyOffline = await cacheService.removeOnlineSocket(
      userId,
      socket.id
    );

    // Chỉ broadcast khi socket cuối cùng của user đóng
    if (isCompletelyOffline) {
      const updatedOnlineList = await cacheService.getAllOnlineUsers();
      io.emit("online-users", updatedOnlineList);
    }
  });
});

export { io, app, server };
