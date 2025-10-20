import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type Props = {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
};

export type YouTubeAudioRef = {
  play: () => void;
  pause: () => void;
  seekTo: (sec: number) => void;
  setVolume: (v: number) => void; // 0..100
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
};

const YouTubeAudio = forwardRef<YouTubeAudioRef, Props>(({ videoId, onReady, onStateChange }, ref) => {
  const iframeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function loadApi() {
      if (window.YT && window.YT.Player) return init();
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => init();
    }
    function init() {
      if (!iframeRef.current) return;
      playerRef.current = new window.YT.Player(iframeRef.current, {
        height: "0",
        width: "0",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setReady(true);
            onReady?.();
          },
          onStateChange: (e: any) => {
            onStateChange?.(e.data);
          },
        },
      });
    }
    loadApi();
    return () => {
      try { playerRef.current?.destroy?.(); } catch {}
    };
  }, [videoId]);

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo?.(),
    pause: () => playerRef.current?.pauseVideo?.(),
    seekTo: (sec: number) => playerRef.current?.seekTo?.(sec, true),
    setVolume: (v: number) => playerRef.current?.setVolume?.(v),
    getVolume: () => playerRef.current?.getVolume?.() ?? 100,
    getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
    getDuration: () => playerRef.current?.getDuration?.() ?? 0,
    isMuted: () => playerRef.current?.isMuted?.() ?? false,
    mute: () => playerRef.current?.mute?.(),
    unMute: () => playerRef.current?.unMute?.(),
  }), []);

  return (
    <div style={{ width: 0, height: 0, overflow: "hidden" }}>
      {}
      <div ref={iframeRef} />
      {!ready && <span className="sr-only">Loading YouTube player…</span>}
    </div>
  );
});

export default YouTubeAudio;
