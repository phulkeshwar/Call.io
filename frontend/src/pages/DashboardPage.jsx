import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "../components/Header";
import { UserList } from "../components/UserList";
import { CallPanel } from "../components/CallPanel";
import { ChatPanel } from "../components/ChatPanel";
import { IncomingCallModal } from "../components/IncomingCallModal";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export function DashboardPage() {
  const { user, loading } = useAuth();
  const { activeChat } = useChat();

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("callio_sidebar_width");
    return saved ? Math.min(Math.max(Number(saved), 200), 550) : 300;
  });

  const [chatWidth, setChatWidth] = useState(() => {
    const saved = localStorage.getItem("callio_chat_width");
    return saved ? Math.min(Math.max(Number(saved), 280), 750) : 380;
  });

  const [activeMobileTab, setActiveMobileTab] = useState("call"); // "users" | "call" | "chat"
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-switch mobile tab to chat if user opens a chat on mobile
  useEffect(() => {
    if (activeChat && isMobile) {
      setActiveMobileTab("chat");
    }
  }, [activeChat, isMobile]);

  // Drag resizing logic
  useEffect(() => {
    function handleMouseMove(e) {
      if (isResizingLeft.current) {
        const newWidth = Math.min(Math.max(e.clientX, 200), 550);
        setSidebarWidth(newWidth);
        localStorage.setItem("callio_sidebar_width", newWidth);
      } else if (isResizingRight.current) {
        const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 280), 750);
        setChatWidth(newWidth);
        localStorage.setItem("callio_chat_width", newWidth);
      }
    }

    function handleMouseUp() {
      if (isResizingLeft.current || isResizingRight.current) {
        isResizingLeft.current = false;
        isResizingRight.current = false;
        document.body.classList.remove("resizing-active");
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizingLeft = (e) => {
    e.preventDefault();
    isResizingLeft.current = true;
    document.body.classList.add("resizing-active");
  };

  const startResizingRight = (e) => {
    e.preventDefault();
    isResizingRight.current = true;
    document.body.classList.add("resizing-active");
  };

  const resetLeftWidth = () => {
    setSidebarWidth(300);
    localStorage.setItem("callio_sidebar_width", 300);
  };

  const resetRightWidth = () => {
    setChatWidth(380);
    localStorage.setItem("callio_chat_width", 380);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="dashboard">
      <Header />

      {/* Mobile Navigation Tab Bar (visible on screens < 900px) */}
      {isMobile && (
        <div className="mobile-tab-bar">
          <button
            className={`mobile-tab-btn ${activeMobileTab === "users" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("users")}
          >
            👥 People
          </button>
          <button
            className={`mobile-tab-btn ${activeMobileTab === "call" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("call")}
          >
            📞 Call
          </button>
          <button
            className={`mobile-tab-btn ${activeMobileTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("chat")}
          >
            💬 Chat {activeChat ? "•" : ""}
          </button>
        </div>
      )}

      <div className="dashboard-body">
        {/* People Online Sidebar */}
        <aside
          className={`sidebar ${isMobile && activeMobileTab !== "users" ? "mobile-hidden" : ""}`}
          style={!isMobile ? { width: `${sidebarWidth}px`, flexShrink: 0 } : undefined}
        >
          <div className="sidebar-header">
            <h3>People Online</h3>
          </div>
          <UserList />
        </aside>

        {/* Resizer Handle: Left Sidebar */}
        {!isMobile && (
          <div
            className="resizer-handle"
            onMouseDown={startResizingLeft}
            onDoubleClick={resetLeftWidth}
            title="Drag to resize People Online sidebar (Double-click to reset)"
          />
        )}

        {/* Center Main Area: Calling Panel (auto-grows/contracts) */}
        <div className={`main-area ${isMobile && activeMobileTab !== "call" ? "mobile-hidden" : ""}`}>
          <CallPanel />
        </div>

        {/* Resizer Handle: Right Chat Panel (visible when activeChat exists) */}
        {!isMobile && activeChat && (
          <div
            className="resizer-handle"
            onMouseDown={startResizingRight}
            onDoubleClick={resetRightWidth}
            title="Drag to resize Chatting panel (Double-click to reset)"
          />
        )}

        {/* Chat Panel */}
        {(!isMobile || activeMobileTab === "chat") && (
          <ChatPanel width={!isMobile ? chatWidth : undefined} />
        )}
      </div>

      <IncomingCallModal />
    </main>
  );
}