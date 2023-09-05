const express = require("express");
const controller = require("../../controllers/message");
const auth = require("../../middleware/index");

const router = express.Router();

router.get("/new-messages", auth.auth, controller.getNewMessages);

router.post("/delete-message", auth.auth, controller.deleteMessage);

router.post("/delete-conversation", auth.auth, controller.deleteConversation);

router.get("/:conversationId/messages", auth.auth, controller.getAllMessages);

router.post("/:conversationId/messages", auth.auth, controller.createMessage);

// router.get("/:conversationId", auth.auth, controller.getConversationById);

router.post("/:id", auth.auth, controller.newConversation);

router.get("/", auth.auth, controller.getConversations);

module.exports = router;
