import { Message } from "../models/Message.js";

export async function getChatHistory(req, res) {
  try {
    const { peerId } = req.params;
    const currentUserId = req.user._id;

    if (!peerId) {
      return res.status(400).json({ message: "Peer ID is required" });
    }

    // Fetch messages where (from current and to peer) OR (from peer and to current)
    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: peerId },
        { from: peerId, to: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("from", "name userId");

    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      text: msg.text,
      timestamp: msg.createdAt.getTime(),
      isSelf: msg.from._id.toString() === currentUserId.toString(),
      senderName: msg.from.name,
      senderUserId: msg.from.userId,
    }));

    return res.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Failed to get chat history:", error);
    return res.status(500).json({ message: "Failed to retrieve chat history" });
  }
}
