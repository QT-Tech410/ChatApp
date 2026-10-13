// QUAN TRỌNG: phải là dòng đầu tiên. ES module imports được evaluate trước khi
// body của server.js chạy, nên nếu dotenv.config() nằm ở dưới, các module import
// (như socket/index.js) sẽ đọc process.env khi chưa có giá trị → CORS origin undefined.
import "dotenv/config";

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import { authLimiter } from "./middlewares/rateLimitMiddleware.js";
import cors from "cors";
import helmet from "helmet";
// import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { app, server } from "./socket/index.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// CLOUDINARY Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// swagger
// const swaggerDocument = JSON.parse(fs.readFileSync("./src/swagger.json", "utf8"));

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// public routes — auth có rate limit chống brute-force
app.use("/api/auth", authLimiter, authRoute);

// private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

// 404 cho route không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy route" });
});

// global error handler — lỗi throw/next(err) từ middleware (multer, validate...)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Lỗi không xử lý:", err.message);
  const status = err.status ?? (err.code === 11000 ? 409 : 500);
  res.status(status).json({
    message: err.status ? err.message : "Lỗi hệ thống",
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});
