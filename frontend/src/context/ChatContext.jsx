import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "./SocketContext";
import { api } from "../api/client";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { socket } = useSocket();

  // activeChat: { _id, name, country, userId } or null
  const [activeChat, setActiveChat] = useState(null);
  // messages: Map<peerId, Array<{ id, from, text, timestamp, isSelf }>>
  const [messagesMap, setMessagesMap] = useState({});
  // typingUsers: Set of user IDs currently typing
  const [typingUsers, setTypingUsers] = useState(new Set());
  // unread: Map<peerId, count>
  const [unreadMap, setUnreadMap] = useState({});

  const typingTimeoutRef = useRef({});
  const activeChatRef = useRef(null);

  // Keep ref in sync with state
  activeChatRef.current = activeChat;

  const openChat = useCallback(async (peer) => {
    setActiveChat(peer);
    // Clear unread for this peer
    setUnreadMap((prev) => {
      const next = { ...prev };
      delete next[peer._id];
      return next;
    });

    try {
      const { data } = await api.get(`/messages/${peer._id}`);
      setMessagesMap((prev) => ({
        ...prev,
        [peer._id]: data.messages || [],
      }));

      // Mark received messages as read in DB
      await api.put(`/messages/read/${peer._id}`);

      // Emit read status in real-time so other user's ticks turn green
      if (socket) {
        socket.emit("chat:read", { peerId: peer._id });
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, [socket]);

  const closeChat = useCallback(() => {
    setActiveChat(null);
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!socket || !activeChat || !text.trim()) return;
      socket.emit("chat:send", {
        to: activeChat._id,
        text: text.trim(),
      });
    },
    [socket, activeChat]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!socket || !activeChat) return;
      socket.emit("chat:typing", {
        to: activeChat._id,
        isTyping,
      });
    },
    [socket, activeChat]
  );

  // Listen for incoming messages
  const handleReceive = useCallback(
    (msg) => {
      const peerId = msg.isSelf ? activeChatRef.current?._id : msg.from._id;
      if (!peerId) return;

      const chatMsg = {
        id: msg.id,
        text: msg.text,
        timestamp: msg.timestamp,
        isSelf: !!msg.isSelf,
        senderName: msg.from?.name,
        senderUserId: msg.from?.userId,
        status: msg.status || "sent",
      };

      setMessagesMap((prev) => ({
        ...prev,
        [peerId]: [...(prev[peerId] || []), chatMsg],
      }));

      // If the message is from someone else and they're not the active chat, increment unread
      if (!msg.isSelf && activeChatRef.current?._id !== peerId) {
        setUnreadMap((prev) => ({
          ...prev,
          [peerId]: (prev[peerId] || 0) + 1,
        }));
      } else if (!msg.isSelf && activeChatRef.current?._id === peerId) {
        // If we are currently in this active chat, immediately mark it read in MongoDB and notify peer in real-time
        api.put(`/messages/read/${peerId}`).catch((err) => console.error(err));
        if (socket) {
          socket.emit("chat:read", { peerId });
        }
      }
    },
    [socket]
  );

  // Listen for typing indicators
  const handleTyping = useCallback(({ from, isTyping }) => {
    setTypingUsers((prev) => {
      const next = new Set(prev);
      if (isTyping) {
        next.add(from);
        // Auto-clear after 3s
        if (typingTimeoutRef.current[from]) {
          clearTimeout(typingTimeoutRef.current[from]);
        }
        typingTimeoutRef.current[from] = setTimeout(() => {
          setTypingUsers((p) => {
            const n = new Set(p);
            n.delete(from);
            return n;
          });
        }, 3000);
      } else {
        next.delete(from);
      }
      return next;
    });
  }, []);

  // Listen for read receipts
  const handleReadReceipt = useCallback(({ readerId, status }) => {
    setMessagesMap((prev) => {
      const peerMsgs = prev[readerId] || [];
      const updatedMsgs = peerMsgs.map((msg) => {
        if (msg.isSelf) {
          if (status === "read") {
            return { ...msg, status: "read" };
          }
          if (status === "delivered") {
            if (!msg.status || msg.status === "sent") {
              return { ...msg, status: "delivered" };
            }
          }
        }
        return msg;
      });
      return {
        ...prev,
        [readerId]: updatedMsgs,
      };
    });
  }, []);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    socket.on("chat:receive", handleReceive);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:read-receipt", handleReadReceipt);

    return () => {
      socket.off("chat:receive", handleReceive);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:read-receipt", handleReadReceipt);
    };
  }, [socket, handleReceive, handleTyping, handleReadReceipt]);

  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const getMessages = useCallback(
    (peerId) => messagesMap[peerId] || [],
    [messagesMap]
  );

  const getUnread = useCallback(
    (peerId) => unreadMap[peerId] || 0,
    [unreadMap]
  );

  const value = useMemo(
    () => ({
      activeChat,
      openChat,
      closeChat,
      sendMessage,
      sendTyping,
      getMessages,
      getUnread,
      typingUsers,
      messagesMap,
    }),
    [activeChat, openChat, closeChat, sendMessage, sendTyping, getMessages, getUnread, typingUsers, messagesMap]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
