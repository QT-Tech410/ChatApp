import express from "express";
import {
  addMembersToGroup,
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  removeMemberFromGroup,
  searchMessages,
  updateGroupInfo,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";
import { checkConversationMember } from "../middlewares/conversationMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
// mọi route theo :conversationId phải verify người gọi là thành viên (chống IDOR)
router.get(
  "/:conversationId/messages/search",
  checkConversationMember,
  searchMessages
);
router.get(
  "/:conversationId/messages",
  checkConversationMember,
  getMessages
);
router.patch("/:conversationId/seen", checkConversationMember, markAsSeen);
router.post(
  "/:conversationId/members",
  checkConversationMember,
  addMembersToGroup
);
router.delete(
  "/:conversationId/members/:memberId",
  checkConversationMember,
  removeMemberFromGroup
);
router.patch(
  "/:conversationId/group",
  checkConversationMember,
  updateGroupInfo
);

export default router;
