import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getChatHistory } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:peerId", authMiddleware, getChatHistory);

export default router;
