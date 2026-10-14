import { redisClient, isRedisAvailable } from "../libs/redis.js";

// Bộ đệm In-Memory Fallback khi không có Redis
const memoryCache = new Map(); // key -> { value, expiresAt }
const memoryOnlineUsers = new Map(); // userId -> Set<socketId>

// Tự động dọn dẹp memoryCache mỗi 60 giây tránh leak RAM
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 60000);

export const cacheService = {
  // Lấy dữ liệu từ Cache
  async get(key) {
    try {
      if (isRedisAvailable() && redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (err) {
      console.warn(`[Cache] Lỗi đọc Redis key ${key}:`, err.message);
    }

    // Fallback: In-Memory
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },

  // Lưu dữ liệu vào Cache với TTL (giây)
  async set(key, value, ttlSeconds = 300) {
    try {
      if (isRedisAvailable() && redisClient) {
        await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return;
      }
    } catch (err) {
      console.warn(`[Cache] Lỗi ghi Redis key ${key}:`, err.message);
    }

    // Fallback: In-Memory
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  // Xoá một key
  async del(key) {
    try {
      if (isRedisAvailable() && redisClient) {
        await redisClient.del(key);
      }
    } catch (err) {
      console.warn(`[Cache] Lỗi xoá Redis key ${key}:`, err.message);
    }
    memoryCache.delete(key);
  },

  // Xoá các key theo tiền tố (pattern prefix)
  async delPrefix(prefix) {
    try {
      if (isRedisAvailable() && redisClient) {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      }
    } catch (err) {
      console.warn(`[Cache] Lỗi delPrefix Redis ${prefix}:`, err.message);
    }

    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  },

  // ================= Quản lý Online Presence =================
  async addOnlineSocket(userId, socketId) {
    const uId = userId.toString();
    try {
      if (isRedisAvailable() && redisClient) {
        await redisClient.sadd(`online_sockets:${uId}`, socketId);
        await redisClient.sadd("online_users", uId);
        return;
      }
    } catch (err) {
      console.warn("[Cache] Lỗi addOnlineSocket Redis:", err.message);
    }

    // Fallback In-Memory
    let sockets = memoryOnlineUsers.get(uId);
    if (!sockets) {
      sockets = new Set();
      memoryOnlineUsers.set(uId, sockets);
    }
    sockets.add(socketId);
  },

  async removeOnlineSocket(userId, socketId) {
    const uId = userId.toString();
    try {
      if (isRedisAvailable() && redisClient) {
        await redisClient.srem(`online_sockets:${uId}`, socketId);
        const count = await redisClient.scard(`online_sockets:${uId}`);
        if (count === 0) {
          await redisClient.srem("online_users", uId);
          return true; // đã offline hoàn toàn
        }
        return false;
      }
    } catch (err) {
      console.warn("[Cache] Lỗi removeOnlineSocket Redis:", err.message);
    }

    // Fallback In-Memory
    const sockets = memoryOnlineUsers.get(uId);
    if (!sockets) return true;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      memoryOnlineUsers.delete(uId);
      return true; // offline hoàn toàn
    }
    return false;
  },

  async getAllOnlineUsers() {
    try {
      if (isRedisAvailable() && redisClient) {
        return await redisClient.smembers("online_users");
      }
    } catch (err) {
      console.warn("[Cache] Lỗi getAllOnlineUsers Redis:", err.message);
    }

    return Array.from(memoryOnlineUsers.keys());
  },

  // Xoá cache tin nhắn và cache hội thoại của các thành viên liên quan
  async invalidateConversation(conversationId, participantUserIds = []) {
    if (conversationId) {
      await this.delPrefix(`convo_msgs:${conversationId.toString()}`);
    }
    if (Array.isArray(participantUserIds) && participantUserIds.length > 0) {
      await Promise.all(
        participantUserIds.map((uid) =>
          this.del(`user_convos:${uid.toString()}`)
        )
      );
    }
  },
};
