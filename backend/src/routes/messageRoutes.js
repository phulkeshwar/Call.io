import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getChatHistory, markAsRead } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:peerId", authMiddleware, getChatHistory);
router.put("/read/:peerId", authMiddleware, markAsRead);

export default router;
