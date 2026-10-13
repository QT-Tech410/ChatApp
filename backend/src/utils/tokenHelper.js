import crypto from "crypto";

// Refresh token được lưu dưới dạng hash SHA-256 trong DB (không lưu plaintext).
// Nếu DB bị lộ, kẻ tấn công chỉ lấy được hash — không thể dùng hash như một
// refresh token hợp lệ để đăng nhập (server luôn hash token nhận được rồi mới so).
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
