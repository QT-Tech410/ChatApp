import { cacheService } from "../services/cacheService.js";

const WINDOW_SECONDS = 5;
const MAX_MESSAGES = 10;

// Rate limiting theo từng user gửi tin nhắn (chống spam bot / DoS)
export const messageRateLimiter = async (req, res, next) => {
  const userId = req.user?._id?.toString();
  if (!userId) return next();

  const key = `rate_limit:msg:${userId}`;
  try {
    const currentCount = (await cacheService.get(key)) || 0;

    if (currentCount >= MAX_MESSAGES) {
      return res.status(429).json({
        message: "Bạn đang gửi tin nhắn quá nhanh. Vui lòng chậm lại một chút.",
      });
    }

    await cacheService.set(key, currentCount + 1, WINDOW_SECONDS);
    next();
  } catch (error) {
    console.error("[RateLimit] Lỗi kiểm tra giới hạn tin nhắn:", error);
    next(); // Không chặn người dùng nếu bộ đếm gặp lỗi kỹ thuật
  }
};
