import express from "express";

import {
  sendDirectMessage,
  sendGroupMessage,
  uploadMessageImage,
} from "../controllers/messageController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadMessageImage);
router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);

export default router;
