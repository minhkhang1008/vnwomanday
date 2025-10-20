import { useEffect, useRef, useState } from "react";
import { Disc3, Pause, Play, Volume2, Link2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import YouTubeAudio, { type YouTubeAudioRef } from "./YouTubeAudio";
import { extractYouTubeId } from "../utils/youtube";

const DEFAULT_URL = "https://youtu.be/o-2yt0ZZZ6o?si=9k0tdbMc6p6k0v3i";

export default function AudioCenter() {
  const ytRef = useRef<YouTubeAudioRef>(null);
  const [open, setOpen] = useState(false);
  const [ytId, setYtId] = useState<string>(() => extractYouTubeId(DEFAULT_URL) || "");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [youtubeInput, setYoutubeInput] = useState("");

  useEffect(() => {
    let id: number;
    const tick = () => {
      if (ytRef.current) {
        setProgress(ytRef.current.getCurrentTime());
        setDuration(ytRef.current.getDuration());
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    ytRef.current?.setVolume(Math.round(volume * 100));
  }, [volume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handlePlayPause = () => {
    if (!ytRef.current) return;
    if (playing) { ytRef.current.pause(); setPlaying(false); }
    else { ytRef.current.play(); setPlaying(true); }
  };

  const handleSeek = (sec: number) => {
    ytRef.current?.seekTo(sec);
    setProgress(sec);
  };

  const displayTime = (s: number) => {
    if (!isFinite(s)) return "00:00";
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const onYTState = (state: number) => {
    if (state === 1) setPlaying(true);
    if (state === 2 || state === 0) setPlaying(false);
  };

  const setYouTubeByUrl = () => {
    const id = extractYouTubeId(youtubeInput);
    if (!id) return alert("Link YouTube không hợp lệ!");
    setYtId(id);
    setPlaying(false);
    setProgress(0);
    setYoutubeInput("");
  };

  return (
    <>
      {!open && (
        <div className="fixed right-20 bottom-5 z-40 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 text-white text-[12px] shadow-lg">
          tuỳ chỉnh nhạc nền ở đây nè ➡️
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className={`fixed right-4 bottom-4 z-40 grid place-items-center h-12 w-12 rounded-full border border-white/30 bg-white/15 backdrop-blur-md text-white shadow-lg hover:bg-white/25 transition ${
          playing ? "animate-spin-slow" : ""
        }`}
      >
        <Disc3 className="h-7 w-7" />
        <style>{`.animate-spin-slow{animation:spin 3.6s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </button>

      {/* Hidden YouTube backend */}
      {ytId && (
        <YouTubeAudio
          ref={ytRef}
          videoId={ytId}
          onStateChange={onYTState}
        />
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed z-50 right-0 left-0 bottom-0 md:left-auto md:right-4 md:bottom-4"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div
                className="mx-3 md:mx-0 w-[calc(100%-1.5rem)] md:w-[360px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-3 text-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-white/30 bg-white/10 grid place-items-center ${playing ? "animate-spin-slow" : ""}`}>
                      <Disc3 className="h-6 w-6" />
                    </div>
                    <button
                      onClick={handlePlayPause}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                    >
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {playing ? "Tạm dừng" : "Phát"}
                    </button>
                  </div>
                  <button
                    aria-label="Đóng"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2 hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-[11px] sm:text-xs mb-2 opacity-90">
                  Đây là nhạc mặc định tớ chọn, thả link YouTube vào đây để đổi nhạc nhé
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 opacity-80 shrink-0" />
                  <input
                    className="flex-1 rounded-md bg-white/10 px-2 py-1 text-sm outline-none placeholder-white/60"
                    placeholder="Dán link YouTube…"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") setYouTubeByUrl(); }}
                  />
                  <button
                    onClick={setYouTubeByUrl}
                    className="rounded-md bg-white/20 px-2 py-1 text-xs hover:bg-white/30 shrink-0"
                  >
                    Đổi
                  </button>
                </div>

                <div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, Math.floor(duration))}
                    value={Math.floor(progress)}
                    onChange={(e) => handleSeek(+e.target.value)}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-[11px] sm:text-xs opacity-80">
                    <span>{displayTime(progress)}</span>
                    <span>{displayTime(duration)}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(+e.target.value / 100)}
                    className="flex-1"
                  />
                  <span className="text-[11px] sm:text-xs w-10 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
