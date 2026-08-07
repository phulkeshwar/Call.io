import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { useSocket } from "../context/SocketContext";
import { useCall } from "../context/CallContext";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { CountryFlag } from "./CountryFlag";

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUserIds, busyUserIds, isSocketConnected } = useSocket();
  const { callState, startCall } = useCall();
  const { openChat, getUnread } = useChat();
  const { token, user: currentUser } = useAuth();

  useEffect(() => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      return;
    }

    async function fetchUsers() {
      setLoading(true);
      try {
        const { data } = await api.get("/users");
        setUsers((data.users || []).filter((item) => item._id !== currentUser?._id));
      } catch (error) {
        setUsers([]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [token, currentUser?._id]);

  const [localLastActiveMap, setLocalLastActiveMap] = useState({});
  const prevOnlineRef = useRef([]);

  useEffect(() => {
    const prev = prevOnlineRef.current;
    const current = onlineUserIds || [];

    // Find users who just connected or just disconnected
    const justConnected = current.filter((uid) => !prev.includes(uid));
    const justDisconnected = prev.filter((uid) => !current.includes(uid));

    if (justConnected.length > 0 || justDisconnected.length > 0) {
      setLocalLastActiveMap((oldMap) => {
        const nextMap = { ...oldMap };
        const nowStr = new Date().toISOString();

        // Mark their transition action time as 'now'
        justConnected.forEach((uid) => {
          nextMap[uid] = nowStr;
        });
        justDisconnected.forEach((uid) => {
          nextMap[uid] = nowStr;
        });

        return nextMap;
      });
    }

    prevOnlineRef.current = current;
  }, [onlineUserIds]);

  const normalizedUsers = users.map((user) => {
    const isOnline = onlineUserIds.includes(user._id);
    const isBusy = busyUserIds.includes(user._id);
    const isAvailable = isOnline && !isBusy;
    const activeTime = localLastActiveMap[user._id] || user.lastActive || user.createdAt;

    const wasOnline = prevOnlineRef.current.includes(user._id);
    const disconnectedAt = (!isOnline && wasOnline)
      ? (localLastActiveMap[user._id] || user.disconnectedAt)
      : user.disconnectedAt;

    return {
      ...user,
      isOnline,
      isBusy,
      isAvailable,
      lastActive: activeTime,
      disconnectedAt: disconnectedAt || null,
    };
  });

  const toTime = (val) => {
    if (!val) return 0;
    const t = typeof val === "number" ? val : new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  };

  const sortedUsers = [...normalizedUsers].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    // For offline users: prefer disconnectedAt over lastActive
    const timeA = toTime(
      a.isOnline ? (a.lastActive ?? a.createdAt) : (a.disconnectedAt ?? a.lastActive ?? a.createdAt)
    );
    const timeB = toTime(
      b.isOnline ? (b.lastActive ?? b.createdAt) : (b.disconnectedAt ?? b.lastActive ?? b.createdAt)
    );

    return timeB - timeA;
  });

  function handleChat(user) {
    openChat({
      _id: user._id,
      name: user.name,
      country: user.country,
      userId: user.userId,
      flag: <CountryFlag countryName={user.country} />,
    });
  }

  function getStatusDotColor(user) {
    if (user.isAvailable) return "var(--success)";
    if (user.isBusy) return "var(--warning)";
    return "var(--text-muted)";
  }

  function getStatusLabel(user) {
    if (user.isAvailable) return "🟢 Available";
    if (user.isBusy) return "🟡 Busy";
    return "⚪ Offline";
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "online" | "available"

  const filteredUsers = sortedUsers.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.userId || "").includes(searchQuery) ||
      (u.country || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "online") return u.isOnline;
    if (statusFilter === "available") return u.isAvailable;
    return true;
  });

  return (
    <section className="user-list" aria-label="People Online Directory">
      {/* Search & Filter Bar */}
      <div className="user-search-bar" style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <input
          type="text"
          placeholder="🔍 Search name, ID, country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search users by name, user ID, or country"
          style={{
            width: "100%",
            padding: "0.4rem 0.7rem",
            fontSize: "0.8rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-glass)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {["all", "online", "available"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`btn btn-sm ${statusFilter === filter ? "btn-primary" : ""}`}
              style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.5rem",
                textTransform: "capitalize",
                flex: 1,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {!isSocketConnected && (
        <p style={{ padding: "0.5rem", color: "var(--warning)", fontSize: "0.8rem", textAlign: "center" }}>
          ⚠ Reconnecting...
        </p>
      )}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div className="loading-spinner" />
        </div>
      )}
      {!loading && filteredUsers.length === 0 && (
        <div className="no-chat">
          <span style={{ fontSize: "2rem", opacity: 0.3 }}>👥</span>
          <p style={{ fontSize: "0.85rem" }}>
            {searchQuery ? "No matching users found" : "No other users yet"}
          </p>
        </div>
      )}

      <div role="list" aria-label="Users list">
        {filteredUsers.map((user) => {
        const flag = <CountryFlag countryName={user.country} />;
        const unread = getUnread(user._id);
        const dotColor = getStatusDotColor(user);
        const canCall = user.isAvailable && callState === "idle" && isSocketConnected;

        return (
          <article className="user-card" key={user._id}>
            <div className="user-avatar">
              {flag}
              <span 
                className="status-dot" 
                style={{ 
                  background: dotColor,
                  boxShadow: user.isAvailable ? `0 0 6px var(--success-glow)` : user.isBusy ? `0 0 5px rgba(245, 158, 11, 0.3)` : 'none',
                  animation: user.isAvailable || user.isBusy ? 'pulse 2s infinite' : 'none'
                }} 
              />
            </div>

            <div className="user-content-wrapper">
              <div className="user-header-row">
                <h4 className="user-name" title={user?.name || ""}>
                  {(user?.name || "").length > 5 ? (user?.name || "").slice(0, 5) + ".." : (user?.name || "Unknown")}
                </h4>
                <span className="uid">#{user?.userId || ""}</span>
                <span className="status-label" style={{ color: dotColor }}>
                  {getStatusLabel(user)}
                </span>
              </div>

              <div className="user-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => handleChat(user)}
                  type="button"
                  title="Chat"
                  style={{ position: "relative" }}
                >
                  💬
                  {unread > 0 && (
                    <span style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "var(--danger)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: "0.6rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}>
                      {unread}
                    </span>
                  )}
                </button>
                <button
                  className="btn btn-sm"
                  disabled={!canCall}
                  onClick={() => startCall(user, "audio")}
                  type="button"
                  title="Audio call"
                  style={{ opacity: canCall ? 1 : 0.3 }}
                >
                  🎤
                </button>
                <button
                  className="btn btn-sm"
                  disabled={!canCall}
                  onClick={() => startCall(user, "video")}
                  type="button"
                  title="Video call"
                  style={{ opacity: canCall ? 1 : 0.3 }}
                >
                  📹
                </button>
              </div>
            </div>
          </article>
        );
      })}
      </div>
    </section>
  );
}
