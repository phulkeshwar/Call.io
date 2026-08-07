import { useCall } from "../context/CallContext";
import { VideoPane } from "./VideoPane";

export function CallPanel() {
  const {
    activeCall,
    callState,
    localStream,
    remoteStream,
    callTimer,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    endCall,
  } = useCall();

  if (!activeCall && callState !== "calling") {
    return (
      <section className="call-panel idle" aria-label="Call Status Idle">
        <div className="idle-content">
          <div className="idle-icon">📞</div>
          <h3>Ready to Connect</h3>
          <p>Select an online user from the sidebar to start an anonymous call or chat.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="call-panel" aria-label="Active Call Session">
      <div className="call-header">
        <h3>
          {activeCall?.peer?.name || "Connecting..."}
          {activeCall?.peer?.userId && (
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.75rem",
              color: "var(--accent)",
              marginLeft: 8,
              fontWeight: 700,
            }}>
              #{activeCall.peer.userId}
            </span>
          )}
        </h3>
        <span className="call-timer" aria-live="polite">
          {callState === "in-call" ? callTimer : "Connecting..."}
        </span>
      </div>

      <div className="video-grid">
        <VideoPane stream={remoteStream} label="Remote" />
        <VideoPane stream={localStream} label="You" muted mirrored />
      </div>

      <div className="call-controls" role="toolbar" aria-label="Call controls">
        <button
          className={`btn btn-icon ${isMuted ? "btn-danger" : ""}`}
          onClick={toggleMute}
          type="button"
          aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button
          className={`btn btn-icon ${isCameraOff ? "btn-danger" : ""}`}
          onClick={toggleCamera}
          type="button"
          aria-label={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCameraOff ? "📷" : "📹"}
        </button>
        <button
          className={`btn btn-icon ${isScreenSharing ? "btn-primary" : ""}`}
          onClick={toggleScreenShare}
          type="button"
          aria-label={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          {isScreenSharing ? "🖥️" : "📺"}
        </button>
        <button
          className="btn btn-icon btn-danger"
          onClick={endCall}
          type="button"
          aria-label="End Call"
          title="End Call"
        >
          📵
        </button>
      </div>
    </section>
  );
}