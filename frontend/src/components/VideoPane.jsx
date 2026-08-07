import { useEffect, useRef } from "react";

export function VideoPane({ stream, muted = false, label, mirrored = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl) return;

    if (stream && stream.getTracks().length > 0) {
      videoEl.srcObject = stream;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Video playback warning:", err);
        });
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [stream]);

  return (
    <div className="video-pane">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className={mirrored ? "mirrored" : ""}
      />
      <div className="video-label">{label}</div>
    </div>
  );
}