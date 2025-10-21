import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper } from "lucide-react";

const compliments = [
  "Tớ chúc các bạn nữ luôn rạng rỡ!",
  "Mỗi ngày đều xinh đẹp và giỏi giang!",
  "Học thật tốt, điểm thi thật cao!",
  "Luôn được yêu thương và trân trọng!",
  "20/10 thật rực rỡ nha!",
  "Hạnh phúc ngập tràn!",
];

const hsl = (h:number,s:number,l:number)=>`hsl(${h} ${s}% ${l}%)`;
const rnd = (a:number,b:number)=>Math.random()*(b-a)+a;
const pick = <T,>(arr:T[])=>arr[Math.floor(Math.random()*arr.length)];

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return m;
}

function Flower({ hue = 320, small = false }: { hue?: number; small?: boolean }) {
  const scale = small ? 0.78 : 1;
  const Petal = ({ rot }: { rot: number }) => (
    <div
      className="absolute left-1/2 top-1/2 h-16 w-10 -translate-x-1/2 -translate-y-1/2 origin-bottom rounded-[50%]"
      style={{
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
        background: `radial-gradient(circle at 50% 30%, ${hsl(hue,85,90)} 0%, ${hsl(hue,80,70)} 60%, ${hsl(hue,70,55)} 100%)`,
        boxShadow: `0 6px 12px ${hsl(hue,60,40)}/0.25`,
      }}
    />
  );
  return (
    <div className="relative h-24 w-24" style={{ transform: `scale(${scale})` }}>
      {[0,60,120,180,240,300].map(r => <Petal key={r} rot={r} />)}
      <div
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${hsl(50,95,85)} 0%, ${hsl(45,90,65)} 60%, ${hsl(40,90,50)} 100%)`,
          boxShadow: `inset 0 0 10px ${hsl(40,70,30)}/0.35, 0 8px 16px ${hsl(40,70,30)}/0.25`,
        }}
      />
    </div>
  );
}

function PetalRain({ enabled, light }: { enabled: boolean; light?: boolean }) {
  const count = light ? 10 : 18;
  const petals = useMemo(() => Array.from({ length: enabled ? count : 0 }, (_, i) => i), [enabled, count]);
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {petals.map((i) => {
        const delay = rnd(0, 6); const duration = rnd(8, 14); const left = rnd(0, 100);
        const hue = rnd(300, 360);
        return (
          <span key={i}
            className="absolute -top-12 inline-block h-6 w-8 rounded-[50%] opacity-70"
            style={{
              left: `${left}%`,
              background: `radial-gradient(circle at 60% 40%, ${hsl(hue,85,92)} 0%, ${hsl(hue,80,70)} 70%, ${hsl(hue,70,55)} 100%)`,
              animation: `petalFall ${duration}s linear ${delay}s infinite`,
              boxShadow: `0 6px 12px ${hsl(hue,60,40)}/0.25`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(-10vh); opacity: 0 }
          10%{ opacity: 0.85 }
          100% { transform: translateY(105vh); opacity: 0 }
        }
      `}</style>
    </div>
  );
}

function ComplimentTickerInline() {
  const [i, setI] = useState(0);
  useEffect(()=>{ const id=setInterval(()=>setI(v=>(v+1)%compliments.length),2400); return ()=>clearInterval(id)},[]);
  return (
    <div className="rounded-full border border-white/15 bg-white/10 px-3 md:px-4 py-2 text-white/90 backdrop-blur-md text-sm md:text-base">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
        >
          {compliments[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- stage metrics (fix lệch click/pattern) ---
function getStageMetrics(el: HTMLDivElement) {
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const padL = parseFloat(cs.paddingLeft || "0");
  const padR = parseFloat(cs.paddingRight || "0");
  const padT = parseFloat(cs.paddingTop || "0");
  const padB = parseFloat(cs.paddingBottom || "0");
  const innerW = rect.width - padL - padR;
  const innerH = rect.height - padT - padB;
  return { rect, padL, padR, padT, padB, innerW, innerH };
}

function heartPoints(n: number, innerW: number, innerH: number, padL: number, padT: number) {
  const pts: {x:number;y:number;}[] = [];
  const scale = Math.min(innerW, innerH) * 0.035;
  const cx = padL + innerW / 2;
  const cy = padT + innerH / 2 + Math.min(innerW, innerH) * 0.02;
  for (let k = 0; k < n; k++) {
    const t = (Math.PI * 2) * (k / n);
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    pts.push({ x: cx + x * scale + rnd(-4, 4), y: cy - y * scale + rnd(-4, 4) });
  }
  return pts;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    // @ts-ignore
    navigator.vibrate(pattern);
  }
}

export default function WomensDay2010() {
  const isMobile = useIsMobile();
  const [blooms, setBlooms] = useState<any[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  const onStageClick = useCallback((e: React.MouseEvent) => {
    const el = stageRef.current!;
    const { rect, padL, padT } = getStageMetrics(el);
    const x = e.clientX - rect.left - padL;
    const y = e.clientY - rect.top - padT;
    const hue = rnd(300, 360); const msg = pick(compliments);
    const id = Date.now() + Math.random();
    setBlooms(b => [...b, { id, x, y, hue, msg }]);
    vibrate([4, 10, 6]);
    setTimeout(()=>setBlooms(b=>b.filter(it=>it.id!==id)), 2400);
  }, []);

  const burstPattern = () => {
    const el = stageRef.current!;
    const { rect, padL, padT, innerW, innerH } = getStageMetrics(el);
    const count = isMobile ? 28 : 44;
    const pts = heartPoints(count, innerW, innerH, padL, padT);
    const news = pts.map(p => ({
      id: Date.now()+Math.random(),
      x: Math.min(rect.width - padL - 20, Math.max(padL + 20, p.x)),
      y: Math.min(rect.height - padT - 20, Math.max(padT + 20, p.y)),
      hue: rnd(300, 360),
      msg: pick(compliments),
    }));
    vibrate([12, 20, 12]);
    setBlooms(b=>[...b, ...news]);
    setTimeout(()=>setBlooms(b=>b.filter(it=>!news.find(n=>n.id===it.id))), 2600);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(60%_60%_at_50%_0%,_rgba(255,255,255,0.15),_rgba(255,255,255,0)_60%),_linear-gradient(120deg,_#ef5da8_0%,_#a78bfa_45%,_#60a5fa_100%)] text-white">
      <div className="relative z-20 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-3 md:px-4 py-10 pb-24 md:pb-10">
        <header className="mb-6 md:mb-8 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="title-fx font-extrabold"
            style={{ fontSize: "clamp(28px, 5.2vw, 56px)", lineHeight: 1.1 }}
          >
            20/10 — Ngày của các bạn nữ
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
            className="mt-2 text-white/90 text-sm md:text-lg"
          >
            Chạm vào màn hình để gieo một bông hoa nhé!
          </motion.p>
        </header>

        <div
          ref={stageRef}
          onClick={onStageClick}
          className="relative z-20 mt-1 flex w-full items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-2 md:p-3 backdrop-blur-md"
          style={{ height: isMobile ? "54vh" : "60vh", cursor: "crosshair" }}
        >
          <AnimatePresence>
            {blooms.map((b) => (
              <motion.div key={b.id}
                initial={{ scale: 0.3, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute"
                style={{ left: b.x, top: b.y, transform: "translate(-50%, -50%)" }}
              >
                <div className="relative">
                  <Flower hue={b.hue} small={isMobile} />
                  <motion.div
                    initial={{ y: -6, opacity: 0 }} animate={{ y: -18, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.8 }}
                    className="absolute left-1/2 top-0 w-40 md:w-48 -translate-x-1/2 -translate-y-full text-center text-[10px] md:text-xs text-white drop-shadow-md"
                  >
                    {b.msg}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <ComplimentTickerInline />
          <button
            onClick={(e)=>{e.stopPropagation(); burstPattern();}}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md transition hover:bg-white/20"
          >
            <PartyPopper className="h-4 w-4" /> Hiện tất cả bông hoa cùng lúc
          </button>
        </div>
      </div>
      <PetalRain enabled={true} light={isMobile} />

      <div className="fixed left-3 bottom-2 z-50 text-[11px] md:text-xs text-white/80">
        author: <span className="font-semibold">Nguyen Hoang Minh Khang</span>
        {" "}(Github: <a className="underline hover:opacity-90" href="https://github.com/minhkhang1008" target="_blank" rel="noreferrer">minhkhang1008</a>)
      </div>
    </div>
  );
}
