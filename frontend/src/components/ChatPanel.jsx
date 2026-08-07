import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";

export function ChatPanel() {
  const {
    activeChat,
    closeChat,
    sendMessage,
    sendTyping,
    getMessages,
    typingUsers,
  } = useChat();

  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const messages = activeChat ? getMessages(activeChat._id) : [];
  const isTyping = activeChat && typingUsers.has(activeChat._id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  // Reset input and textarea height when chat changes
  useEffect(() => {
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [activeChat?._id]);

  function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendTyping(false);
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }

    sendTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = input.substring(0, start) + "  " + input.substring(end);
      setInput(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function renderMessageContent(text) {
    if (!text) return null;

    // Check if message contains explicit code blocks ```code```
    const codeBlockRegex = /```(?:[a-zA-Z]*\n)?([\s\S]*?)```/g;
    if (codeBlockRegex.test(text)) {
      const parts = [];
      let lastIndex = 0;
      text.replace(codeBlockRegex, (match, codeContent, offset) => {
        if (offset > lastIndex) {
          parts.push(<span key={lastIndex}>{text.slice(lastIndex, offset)}</span>);
        }
        parts.push(
          <pre key={offset} className="chat-code-block">
            <code>{codeContent.trim()}</code>
          </pre>
        );
        lastIndex = offset + match.length;
      });
      if (lastIndex < text.length) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
      }
      return parts;
    }

    // Detect code/log structure (multiple lines containing code elements or log patterns)
    const isCodeOrLog =
      text.includes("\n") &&
      (/#include|using namespace|void |int main|def |function |const |let |var |class |public:|private:|import |export |return |console\.log|\{|\}|=>|;\n/i.test(text) ||
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(text) || // Log format
        (text.match(/\n/g) || []).length >= 3); // 4+ lines of text

    if (isCodeOrLog) {
      return (
        <pre className="chat-code-block">
          <code>{text}</code>
        </pre>
      );
    }

    return <span>{text}</span>;
  }

  if (!activeChat) return null;

  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="flag">{activeChat.flag || "🌍"}</span>
          <div>
            <h4>{activeChat.name}</h4>
            <span className="chat-uid">#{activeChat.userId}</span>
          </div>
        </div>
        <button className="btn btn-sm" onClick={closeChat} type="button" title="Close chat">
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <p>No messages yet.<br />Say hello anonymously!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.isSelf ? "sent" : "received"}`}
          >
            {renderMessageContent(msg.text)}
            <span className="bubble-time">
              {formatTime(msg.timestamp)}
              {msg.isSelf && (
                <span 
                  className="message-status-tick" 
                  style={{ 
                    color: msg.status === "read" ? "#39fe32" : "#000000",
                    fontWeight: "900",
                    fontSize: "0.8rem",
                    letterSpacing: "-1.5px",
                    display: "inline-block",
                    minWidth: "12px",
                    textAlign: "right",
                    marginLeft: "4px"
                  }}
                  title={msg.status === "read" ? "Read" : msg.status === "delivered" ? "Delivered" : "Sent"}
                >
                  {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                </span>
              )}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message... (Shift + Enter for new line)"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!input.trim()}>
          ➤
        </button>
      </form>
    </aside>
  );
}
