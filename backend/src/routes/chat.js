const express = require("express");
const {
  chat,
  getConversations,
  getConversation,
  deleteConversation,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/",                            chat);
router.get("/conversations",                getConversations);
router.get("/conversations/:conversationId", getConversation);
router.delete("/conversations/:conversationId", deleteConversation);

module.exports = router;