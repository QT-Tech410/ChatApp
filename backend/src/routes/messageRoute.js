import express from "express";

import {
  deleteMessage,
  editMessage,
  sendDirectMessage,
  sendGroupMessage,
  uploadMessageImage,
} from "../controllers/messageController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";
import { messageRateLimiter } from "../middlewares/messageRateLimit.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadMessageImage);
router.post("/direct", messageRateLimiter, checkFriendship, sendDirectMessage);
router.post("/group", messageRateLimiter, checkGroupMembership, sendGroupMessage);
router.delete("/:messageId", deleteMessage);
router.patch("/:messageId", editMessage);

export default router;
