import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";
import { checkConversationMember } from "../middlewares/conversationMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
// mọi route theo :conversationId phải verify người gọi là thành viên (chống IDOR)
router.get(
  "/:conversationId/messages",
  checkConversationMember,
  getMessages
);
router.patch("/:conversationId/seen", checkConversationMember, markAsSeen);

export default router;
