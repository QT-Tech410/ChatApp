import rateLimit from "express-rate-limit";

// Chống brute-force cho các endpoint đăng nhập / đăng ký.
// Giới hạn theo IP: tối đa 30 yêu cầu trong cửa sổ 15 phút.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
  },
});
