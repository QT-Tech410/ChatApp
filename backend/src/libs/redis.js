import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient = null;
let pubClient = null;
let subClient = null;
let isConnected = false;

const createClientInstance = (name) => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) {
        // Sau 5 lần thử không kết nối được thì giãn cách 30s để tránh spam log
        return 30000;
      }
      return Math.min(times * 1000, 5000);
    },
  });

  client.on("connect", () => {
    isConnected = true;
    console.log(`[Redis] ${name} đã kết nối thành công tới ${REDIS_URL}`);
  });

  client.on("error", (err) => {
    if (isConnected) {
      console.warn(`[Redis] ${name} mất kết nối:`, err.message);
    }
    isConnected = false;
  });

  return client;
};

// Khởi tạo Redis Clients
try {
  redisClient = createClientInstance("Client");
  pubClient = createClientInstance("PubClient");
  subClient = createClientInstance("SubClient");

  // Kết nối bất đồng bộ không chặn luồng khởi động server
  Promise.all([
    redisClient.connect().catch(() => {}),
    pubClient.connect().catch(() => {}),
    subClient.connect().catch(() => {}),
  ]).catch(() => {
    console.warn(
      "[Redis] Không tìm thấy Redis server đang chạy. Hệ thống tự động kích hoạt bộ đệm In-Memory Fallback."
    );
  });
} catch (error) {
  console.warn(
    "[Redis] Khởi tạo Redis thất bại. Sử dụng In-Memory Fallback:",
    error.message
  );
}

export const isRedisAvailable = () => isConnected;
export { redisClient, pubClient, subClient };
