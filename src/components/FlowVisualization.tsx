import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playBonk, playWhoosh, playCoin, isMuted, setMuted } from "@/lib/sounds";
import legoPixelMan from "@/assets/lego-pixel-man.png";

const RESULTS_KEY = "lwfl:autoResults";

const pipeOptions = [
  { key: "tiny", label: '⅜"', diameter: 28, mm: "9.5mm", fits: false },
  { key: "small", label: '½"', diameter: 40, mm: "12.7mm", fits: false },
  { key: "medium", label: '¾"', diameter: 64, mm: "19.05mm", fits: true },
  { key: "large", label: '1"', diameter: 80, mm: "25.4mm", fits: true },
] as const;

type PipeKey = (typeof pipeOptions)[number]["key"];

type HitboxConfig = { position: number; window: number };
const defaultHitboxes: Record<PipeKey, HitboxConfig> = {
  tiny: { position: 70, window: 12 },
  small: { position: 70, window: 12 },
  medium: { position: 75, window: 14 },
  large: { position: 80, window: 18 },
};

const FlowVisualization = () => {
  const [flowing, setFlowing] = useState(false);
  const [pipeSize, setPipeSize] = useState<PipeKey>("small");
  const [loop, setLoop] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const [hitboxes, setHitboxes] = useState<Record<PipeKey, HitboxConfig>>(defaultHitboxes);
  const [showHitbox, setShowHitbox] = useState(true);
  const [reassembleDuration, setReassembleDuration] = useState(1.0);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [reaction, setReaction] = useState<"idle" | "cheer" | "duck" | "split">("idle");
  const [split, setSplit] = useState(false);
  const [stats, setStats] = useState({ runs: 0, passes: 0, stucks: 0, splits: 0 });
  const [autoTest, setAutoTest] = useState(false);
  const [autoResults, setAutoResults] = useState<Partial<Record<PipeKey, "split" | "stuck">>>(() => {
    try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || "{}"); } catch { return {}; }
  });
  const [autoCurrent, setAutoCurrent] = useState<PipeKey | null>(null);
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
  const prefersReducedMotion = useReducedMotion();
  const coinIdRef = useRef(0);
  const loopRef = useRef(false);
  const autoRef = useRef(false);
  // Centralized timer tracking so unmount / Stop clears everything.
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const addTimer = (id: ReturnType<typeof setTimeout>) => { timersRef.current.add(id); return id; };
  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  };
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const autoTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const pipe = pipeOptions.find((p) => p.key === pipeSize)!;
  const fits = pipe.fits;
  const duration = fits ? 2 / speed : 1 / speed;
  const hitbox = hitboxes[pipeSize];

  // Convert hitbox position (% of stage) to trigger time (ms) using molecule animation timeline.
  // Molecule path: [-13%, 45%, 113%] at times [0, 0.4, 1] of `duration`.
  const computeHitDelay = (posPct: number) => {
    const ms = duration * 1000;
    if (posPct <= 45) {
      const t = (posPct - -13) / (45 - -13); // 0..1 in phase A
      return Math.max(0, t) * 0.4 * ms;
    }
    const t = (posPct - 45) / (113 - 45); // 0..1 in phase B
    return (0.4 + Math.min(1, t) * 0.6) * ms;
  };

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Persist Auto-Test results across reloads.
  useEffect(() => {
    try { localStorage.setItem(RESULTS_KEY, JSON.stringify(autoResults)); } catch { /* ignore */ }
  }, [autoResults]);

  // Unmount: kill every pending timer.
  useEffect(() => () => clearAllTimers(), []);

  const handleFlow = () => {
    setFlowing(true);
    setStats(s => ({ ...s, runs: s.runs + 1 }));
    const sfxDelay = fits ? (1200 / speed) : (900 / speed);
    if (fits) {
      const hitDelay = computeHitDelay(hitbox.position);
      addTimer(setTimeout(() => {
        setStats(s => ({ ...s, passes: s.passes + 1, splits: s.splits + 1 }));
        playWhoosh();
        setReaction("split");
        setSplit(true);
        // Auto-Test: record actual split result here, not at trigger time.
        if (autoRef.current) {
          setAutoResults(r => ({ ...r, [pipeSize]: "split" }));
        }
        const newCoins = Array.from({ length: 3 }, (_, i) => ({
          id: coinIdRef.current++,
          x: 60 + Math.random() * 20,
          y: 20 + i * 15,
        }));
        setCoins(prev => [...prev, ...newCoins]);
        setScore(prev => prev + 10);
        playCoin();
        addTimer(setTimeout(() => {
          setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id)));
        }, 1200));
        addTimer(setTimeout(() => {
          setSplit(false);
          setReaction("cheer");
          addTimer(setTimeout(() => setReaction("idle"), 1000 / speed));
        }, reassembleDuration * 1000 / speed));
      }, hitDelay));
    } else {
      addTimer(setTimeout(() => {
        setStats(s => ({ ...s, stucks: s.stucks + 1 }));
        playBonk();
        setReaction("duck");
        if (autoRef.current) {
          setAutoResults(r => ({ ...r, [pipeSize]: "stuck" }));
        }
        addTimer(setTimeout(() => setReaction("idle"), 1200 / speed));
      }, sfxDelay));
    }
    timeoutRef.current = addTimer(setTimeout(() => {
      setFlowing(false);
      if (loopRef.current) {
        timeoutRef.current = addTimer(setTimeout(() => handleFlow(), 400));
      }
    }, (fits ? 2200 : 1200) / speed));
  };

  const handleStop = () => {
    setLoop(false);
    loopRef.current = false;
    setFlowing(false);
    clearAllTimers();
  };

  // Auto-test sequence: cycles through ½", ¾", 1", ⅜" and records actual split vs stuck.
  const autoSequence: PipeKey[] = ["small", "medium", "large", "tiny"];

  const stopAutoTest = () => {
    autoRef.current = false;
    setAutoTest(false);
    setAutoCurrent(null);
    clearAllTimers();
  };

  const runAutoTest = () => {
    handleStop();
    setAutoResults({});
    setAutoTest(true);
    autoRef.current = true;

    const stepDuration = 2800 / speed;
    autoSequence.forEach((key, i) => {
      autoTimeoutRef.current = addTimer(setTimeout(() => {
        if (!autoRef.current) return;
        setPipeSize(key);
        setAutoCurrent(key);
        addTimer(setTimeout(() => {
          if (!autoRef.current) return;
          handleFlow();
        }, 50));
      }, i * stepDuration));
    });

    autoTimeoutRef.current = addTimer(setTimeout(() => {
      autoRef.current = false;
      setAutoTest(false);
      setAutoCurrent(null);
    }, autoSequence.length * stepDuration));
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  return (
    <div className="space-y-4" style={{ imageRendering: "pixelated" }}>
      {/* Pipe size toggle — pixel buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {pipeOptions.map((p) => {
          const result = autoResults[p.key];
          const isCurrent = autoCurrent === p.key;
          const ring = isCurrent
            ? "ring-2 ring-offset-1 ring-lego-yellow"
            : result === "split"
            ? "ring-2 ring-offset-1 ring-[hsl(48,100%,50%)]"
            : result === "stuck"
            ? "ring-2 ring-offset-1 ring-destructive"
            : "";
          return (
            <button
              key={p.key}
              onClick={() => { setPipeSize(p.key); handleStop(); stopAutoTest(); }}
              disabled={autoTest}
              className={`relative px-3 py-2 font-display font-bold text-xs transition-colors duration-100 border-b-4 active:border-b-0 active:mt-1 disabled:opacity-70 ${
                pipeSize === p.key
                  ? p.fits
                    ? "bg-lego-green border-[hsl(140,60%,28%)] text-primary-foreground"
                    : "bg-destructive border-[hsl(358,100%,32%)] text-destructive-foreground"
                  : "bg-muted border-[hsl(210,20%,78%)] text-foreground"
              } ${ring}`}
              style={{ borderRadius: 0 }}
            >
              {p.label} ({p.mm})
              {result && (
                <span
                  className="absolute -top-2 -right-2 px-1 font-display font-bold text-[8px] border border-foreground"
                  style={{
                    background: result === "split" ? "hsl(48,100%,55%)" : "hsl(358,100%,55%)",
                    color: result === "split" ? "hsl(35,80%,25%)" : "hsl(0,0%,100%)",
                    borderRadius: 0,
                  }}
                >
                  {result === "split" ? "✂" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Speed & loop — pixel style */}
      <div className="flex justify-center items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Spd:</span>
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`w-7 h-7 font-display font-bold text-[10px] border-b-[3px] active:border-b-0 active:mt-[3px] transition-colors ${
                speed === s
                  ? "bg-lego-yellow border-[hsl(48,100%,36%)] text-accent-foreground"
                  : "bg-muted border-[hsl(210,20%,78%)] text-muted-foreground"
              }`}
              style={{ borderRadius: 0 }}
            >
              {s}×
            </button>
          ))}
        </div>
        <button
          onClick={() => setLoop(!loop)}
          disabled={autoTest}
          className={`px-2.5 py-1 font-display font-bold text-[10px] border-b-[3px] active:border-b-0 active:mt-[3px] transition-colors disabled:opacity-50 ${
            loop
              ? "bg-lego-blue border-[hsl(211,100%,22%)] text-primary-foreground"
              : "bg-muted border-[hsl(210,20%,78%)] text-muted-foreground"
          }`}
          style={{ borderRadius: 0 }}
        >
          ↻ Loop {loop ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => (autoTest ? stopAutoTest() : runAutoTest())}
          className={`px-2.5 py-1 font-display font-bold text-[10px] border-b-[3px] active:border-b-0 active:mt-[3px] transition-colors ${
            autoTest
              ? "bg-destructive border-[hsl(358,100%,32%)] text-destructive-foreground"
              : "bg-lego-yellow border-[hsl(48,100%,36%)] text-accent-foreground"
          }`}
          style={{ borderRadius: 0 }}
        >
          {autoTest ? "■ Stop Test" : "▶ Auto-Test"}
        </button>
      </div>

      {/* Hitbox controls — per-pipe-size, pixel style */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
          Hit ({pipe.label}):
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-display text-muted-foreground uppercase">Pos</span>
          <input
            type="range"
            min={20}
            max={110}
            step={1}
            value={hitbox.position}
            onChange={(e) => setHitboxes(h => ({ ...h, [pipeSize]: { ...h[pipeSize], position: +e.target.value } }))}
            className="w-24 accent-lego-blue"
          />
          <span className="w-8 text-center font-display font-bold text-[10px] text-foreground">{hitbox.position}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-display text-muted-foreground uppercase">Win</span>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={hitbox.window}
            onChange={(e) => setHitboxes(h => ({ ...h, [pipeSize]: { ...h[pipeSize], window: +e.target.value } }))}
            className="w-20 accent-lego-yellow"
          />
          <span className="w-8 text-center font-display font-bold text-[10px] text-foreground">{hitbox.window}%</span>
        </div>
        <button
          onClick={() => setShowHitbox(v => !v)}
          className={`px-2 py-1 font-display font-bold text-[9px] border-b-[3px] active:border-b-0 active:mt-[3px] transition-colors ${
            showHitbox
              ? "bg-lego-yellow border-[hsl(48,100%,36%)] text-accent-foreground"
              : "bg-muted border-[hsl(210,20%,78%)] text-muted-foreground"
          }`}
          style={{ borderRadius: 0 }}
        >
          {showHitbox ? "👁 Show" : "Hide"}
        </button>
        <button
          onClick={() => setHitboxes(h => ({ ...h, [pipeSize]: defaultHitboxes[pipeSize] }))}
          className="px-2 py-1 font-display font-bold text-[9px] border-b-[3px] active:border-b-0 active:mt-[3px] bg-muted border-[hsl(210,20%,78%)] text-muted-foreground transition-colors"
          style={{ borderRadius: 0 }}
        >
          Reset
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-display text-muted-foreground uppercase">Reasm</span>
          <button
            onClick={() => setReassembleDuration(d => Math.max(0.2, +(d - 0.1).toFixed(1)))}
            className="w-5 h-5 font-display font-bold text-[10px] border-b-[3px] active:border-b-0 active:mt-[3px] bg-muted border-[hsl(210,20%,78%)] text-foreground transition-colors"
            style={{ borderRadius: 0 }}
          >−</button>
          <span className="w-8 text-center font-display font-bold text-[10px] text-foreground">{reassembleDuration.toFixed(1)}s</span>
          <button
            onClick={() => setReassembleDuration(d => Math.min(2.0, +(d + 0.1).toFixed(1)))}
            className="w-5 h-5 font-display font-bold text-[10px] border-b-[3px] active:border-b-0 active:mt-[3px] bg-muted border-[hsl(210,20%,78%)] text-foreground transition-colors"
            style={{ borderRadius: 0 }}
          >+</button>
        </div>
      </div>

      {/* Game stage — retro platformer look */}
      <div
        className="relative h-48 overflow-hidden border-4 border-foreground"
        style={{
          borderRadius: 0,
          background: "linear-gradient(180deg, hsl(195, 80%, 72%) 0%, hsl(195, 70%, 82%) 100%)",
        }}
      >
        {/* Pixel clouds */}
        <div className="absolute top-4 left-6 flex gap-[2px]" style={{ opacity: 0.7 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-3 h-3 bg-card" style={{ borderRadius: 0, marginTop: i === 0 || i === 4 ? 3 : i === 2 ? -2 : 0 }} />
          ))}
        </div>
        <div className="absolute top-6 right-10 flex gap-[2px]" style={{ opacity: 0.5 }}>
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-card" style={{ borderRadius: 0, marginTop: i === 1 ? -1 : 0 }} />
          ))}
        </div>

        {/* Hitbox visualizer — band where split triggers */}
        {showHitbox && fits && (
          <div
            className="absolute top-0 bottom-8 pointer-events-none border-x-2 border-dashed"
            style={{
              left: `${hitbox.position - hitbox.window / 2}%`,
              width: `${hitbox.window}%`,
              background: "hsla(48,100%,55%,0.15)",
              borderColor: "hsla(48,100%,45%,0.7)",
            }}
          >
            <div
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1 font-display font-bold text-[8px] tracking-wider"
              style={{ background: "hsl(48,100%,55%)", color: "hsl(35,80%,25%)", borderRadius: 0 }}
            >
              HIT
            </div>
          </div>
        )}

        {/* Ground — green platform blocks */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-8 border border-[hsl(140,50%,30%)]"
              style={{
                borderRadius: 0,
                background: i % 2 === 0
                  ? "hsl(100, 50%, 45%)"
                  : "hsl(100, 50%, 40%)",
              }}
            />
          ))}
        </div>

        {/* Pipe — pixel art pipe on the ground */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center">
          {/* Pipe opening top */}
          <motion.div
            animate={{ height: pipe.diameter }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative"
            style={{ width: 140 }}
          >
            {/* Pipe walls - pixel blocks */}
            <div
              className="absolute -top-2 left-0 right-0 h-2"
              style={{ borderRadius: 0, background: "hsl(140, 30%, 35%)", borderLeft: "3px solid hsl(140,30%,25%)", borderRight: "3px solid hsl(140,30%,25%)" }}
            />
            <div
              className="absolute -bottom-2 left-0 right-0 h-2"
              style={{ borderRadius: 0, background: "hsl(140, 30%, 35%)", borderLeft: "3px solid hsl(140,30%,25%)", borderRight: "3px solid hsl(140,30%,25%)" }}
            />
            {/* Pipe interior */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: 0,
                background: "hsl(140, 20%, 20%)",
                borderLeft: "3px solid hsl(140,30%,25%)",
                borderRight: "3px solid hsl(140,30%,25%)",
              }}
            />
            {/* Water flow effect */}
            {flowing && fits && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration, ease: "easeInOut" }}
                className="absolute inset-0"
                style={{ borderRadius: 0, background: "hsla(211, 100%, 50%, 0.2)" }}
              />
            )}
          </motion.div>
        </div>

        {/* Coin block decoration */}
        <div
          className="absolute top-10 right-[20%] w-8 h-8 border-2 border-[hsl(35,80%,35%)] flex items-center justify-center"
          style={{ borderRadius: 0, background: "hsl(35, 70%, 55%)" }}
        >
          <span className="text-[10px] font-bold" style={{ color: "hsl(35,80%,30%)" }}>?</span>
        </div>

        {/* LEGO pixel man — reacts to flow */}
        <AnimatePresence mode="wait">
          {!split ? (
            <motion.div
              key="whole"
              className="absolute bottom-8 flex flex-col items-center"
              style={{ right: "12%" }}
              animate={
                reaction === "cheer"
                  ? { y: [0, -12, 0, -8, 0], rotate: [0, -10, 10, -5, 0] }
                  : reaction === "duck"
                  ? { y: [0, 6], scaleY: [1, 0.7], rotate: [0, 5] }
                  : { y: [0, -2, 0] }
              }
              transition={
                reaction === "idle"
                  ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.5, ease: "easeOut" }
              }
            >
              {reaction === "cheer" && (
                <motion.span
                  className="text-[10px] font-display font-bold mb-0.5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: "hsl(48,100%,40%)" }}
                >
                  YAY!
                </motion.span>
              )}
              {reaction === "duck" && (
                <motion.span
                  className="text-[10px] font-display font-bold mb-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: "hsl(358,100%,44%)" }}
                >
                  EEK!
                </motion.span>
              )}
              <img
                src={legoPixelMan}
                alt="Pixel LEGO construction worker"
                className="w-10 h-10 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </motion.div>
          ) : (
            <>
              {/* Burst particles — LEGO bits + sparkles */}
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
                const dist = 35 + Math.random() * 35;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist - 10;
                const isSparkle = i % 3 === 0;
                const colors = ["hsl(48,100%,55%)", "hsl(358,100%,55%)", "hsl(211,100%,55%)", "hsl(140,60%,50%)", "hsl(0,0%,100%)"];
                const color = isSparkle ? "hsl(48,100%,75%)" : colors[i % colors.length];
                const size = isSparkle ? 3 : 4 + Math.floor(Math.random() * 3);
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute"
                    style={{
                      right: "14%",
                      bottom: "28%",
                      width: size,
                      height: size,
                      background: color,
                      borderRadius: 0,
                      boxShadow: isSparkle ? `0 0 6px ${color}` : "none",
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
                    animate={{
                      x: dx,
                      y: dy,
                      opacity: [1, 1, 0],
                      scale: [0.6, 1.1, 0.4],
                      rotate: isSparkle ? 0 : Math.random() * 360,
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                );
              })}
              {/* Flash */}
              <motion.div
                className="absolute"
                style={{
                  right: "10%",
                  bottom: "24%",
                  width: 40,
                  height: 40,
                  background: "radial-gradient(circle, hsla(48,100%,80%,0.9) 0%, hsla(48,100%,60%,0) 70%)",
                  borderRadius: 0,
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.6, 2] }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              {/* Split into two smaller versions — with motion blur */}
              <motion.div
                key="split-left"
                className="absolute bottom-8 flex flex-col items-center"
                style={{ right: "12%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                animate={{
                  x: -30,
                  y: -20,
                  rotate: -25,
                  scale: 0.6,
                  opacity: [1, 1, 0.9],
                  filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.span
                  className="text-[8px] font-display font-bold mb-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: "hsl(211,100%,50%)" }}
                >
                  WHOA!
                </motion.span>
                <img
                  src={legoPixelMan}
                  alt="Mini LEGO man left"
                  className="w-7 h-7 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </motion.div>
              <motion.div
                key="split-right"
                className="absolute bottom-8 flex flex-col items-center"
                style={{ right: "12%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                animate={{
                  x: 30,
                  y: -15,
                  rotate: 20,
                  scale: 0.6,
                  opacity: [1, 1, 0.9],
                  filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.span
                  className="text-[8px] font-display font-bold mb-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: "hsl(211,100%,50%)" }}
                >
                  OOF!
                </motion.span>
                <img
                  src={legoPixelMan}
                  alt="Mini LEGO man right"
                  className="w-7 h-7 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* LEGO Molecule — pixel art style */}
        <AnimatePresence>
          {flowing && (
            <motion.div
              className="absolute bottom-10 flex items-end gap-0"
              initial={{ left: -80 }}
              animate={
                fits
                  ? { left: ["-80px", "45%", "calc(100% + 80px)"] }
                  : { left: ["-80px", "36%", "36%"], rotate: [0, 0, 8, -8, 5, -5, 0] }
              }
              transition={
                fits
                  ? { duration, ease: "easeInOut", times: [0, 0.4, 1] }
                  : { duration, ease: "easeOut" }
              }
            >
              {/* H left */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-card border border-[hsl(210,20%,80%)]" style={{ borderRadius: 0 }} />
                <div className="w-[2px] h-2 bg-muted-foreground/40" />
              </div>
              {/* O center */}
              <div className="relative">
                <div className="w-10 h-7 bg-lego-red border-b-[3px] border-[hsl(358,100%,32%)]" style={{ borderRadius: 0 }} />
                <div className="absolute -top-[3px] left-1 flex gap-2">
                  <div className="w-3 h-3 bg-lego-red border border-[hsl(358,100%,36%)]" style={{ borderRadius: 0 }} />
                  <div className="w-3 h-3 bg-lego-red border border-[hsl(358,100%,36%)]" style={{ borderRadius: 0 }} />
                </div>
              </div>
              {/* H right */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-card border border-[hsl(210,20%,80%)]" style={{ borderRadius: 0 }} />
                <div className="w-[2px] h-2 bg-muted-foreground/40" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coins */}
        <AnimatePresence>
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute w-6 h-6 border-2 border-[hsl(48,100%,36%)] flex items-center justify-center font-bold text-[10px]"
              style={{
                borderRadius: 0,
                background: "hsl(48, 100%, 50%)",
                color: "hsl(35,80%,30%)",
                left: `${coin.x}%`,
              }}
              initial={{ bottom: coin.y + "%", opacity: 1, scale: 0.5 }}
              animate={{ bottom: `${coin.y + 25}%`, opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              ¢
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Score */}
        {score > 0 && (
          <div className="absolute top-2 right-3 font-display font-bold text-[11px] tracking-wider" style={{ color: "hsl(48,100%,40%)" }}>
            🪙 {score}
          </div>
        )}

        {/* Stuck indicator — pixel text */}
        <AnimatePresence>
          {flowing && !fits && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.9 / speed }}
              className="absolute top-2 right-3 font-display font-bold text-destructive text-sm tracking-wider"
            >
              STUCK!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fit indicator */}
        <div className={`absolute top-2 left-3 text-[10px] font-display font-bold tracking-wider ${fits ? "text-lego-green" : "text-destructive"}`}>
          {fits ? "FITS ✓" : "TOO SMALL ✗"}
        </div>

        <div className="absolute bottom-10 left-3 text-[9px] font-display text-foreground/60 tracking-wider">
          {pipe.label} ({pipe.mm})
        </div>
      </div>

      {/* Action buttons — pixel style */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleFlow}
          disabled={flowing}
          className="bg-lego-yellow border-b-4 border-[hsl(48,100%,36%)] px-6 py-2.5 font-display font-bold text-sm text-accent-foreground disabled:opacity-40 active:border-b-0 active:mt-1 transition-colors"
          style={{ borderRadius: 0 }}
        >
          {flowing ? "Flowing..." : "▸ Send It!"}
        </button>
        {flowing && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleStop}
            className="bg-destructive border-b-4 border-[hsl(358,100%,32%)] px-4 py-2.5 font-display font-bold text-sm text-destructive-foreground active:border-b-0 active:mt-1 transition-colors"
            style={{ borderRadius: 0 }}
          >
          ■ Stop
          </motion.button>
        )}
      </div>

      {/* Stats HUD — pixel style */}
      <div className="flex justify-center">
        <div className="border-2 border-foreground bg-card p-2" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Runs</div>
              <div className="font-display font-bold text-sm text-foreground">{stats.runs}</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-[9px] font-display text-lego-green uppercase tracking-wider">Pass</div>
              <div className="font-display font-bold text-sm text-lego-green">{stats.passes}</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-[9px] font-display text-destructive uppercase tracking-wider">Stuck</div>
              <div className="font-display font-bold text-sm text-destructive">{stats.stucks}</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-[9px] font-display text-lego-blue uppercase tracking-wider">Split</div>
              <div className="font-display font-bold text-sm" style={{ color: "hsl(211,100%,50%)" }}>{stats.splits}</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => setStats({ runs: 0, passes: 0, stucks: 0, splits: 0 })}
              className="px-2 py-1 font-display font-bold text-[9px] border-b-[3px] active:border-b-0 active:mt-[3px] bg-muted border-[hsl(210,20%,78%)] text-muted-foreground transition-colors"
              style={{ borderRadius: 0 }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Test results panel */}
      {(autoTest || Object.keys(autoResults).length > 0) && (
        <div className="flex justify-center">
          <div className="border-2 border-foreground bg-card p-2 min-w-[260px]" style={{ borderRadius: 0 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-[10px] uppercase tracking-wider text-foreground">
                Auto-Test Results
              </span>
              <span className="font-display text-[9px] uppercase tracking-wider text-muted-foreground">
                {autoTest ? "Running…" : "Done"}
              </span>
            </div>
            <div className="space-y-1">
              {autoSequence.map((key) => {
                const p = pipeOptions.find((o) => o.key === key)!;
                const r = autoResults[key];
                const isCurrent = autoCurrent === key;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-2 px-2 py-1 border ${
                      isCurrent ? "border-lego-yellow" : "border-border"
                    }`}
                    style={{
                      borderRadius: 0,
                      background: isCurrent ? "hsla(48,100%,55%,0.15)" : "transparent",
                    }}
                  >
                    <span className="font-display font-bold text-[10px] text-foreground">
                      {p.label} <span className="text-muted-foreground font-normal">({p.mm})</span>
                    </span>
                    {r ? (
                      <span
                        className="px-1.5 py-0.5 font-display font-bold text-[9px] border border-foreground"
                        style={{
                          borderRadius: 0,
                          background: r === "split" ? "hsl(48,100%,55%)" : "hsl(358,100%,55%)",
                          color: r === "split" ? "hsl(35,80%,25%)" : "hsl(0,0%,100%)",
                        }}
                      >
                        {r === "split" ? "✂ SPLIT" : "✗ STUCK"}
                      </span>
                    ) : (
                      <span className="font-display text-[9px] text-muted-foreground uppercase tracking-wider">
                        {isCurrent ? "Testing…" : "Pending"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-center gap-3">
              <span className="font-display text-[9px] uppercase tracking-wider text-muted-foreground">Totals:</span>
              <span className="font-display font-bold text-[10px]" style={{ color: "hsl(48,90%,40%)" }}>
                ✂ {Object.values(autoResults).filter((v) => v === "split").length} Split
              </span>
              <span className="font-display font-bold text-[10px] text-destructive">
                ✗ {Object.values(autoResults).filter((v) => v === "stuck").length} Stuck
              </span>
              <span className="font-display text-[9px] text-muted-foreground">
                {Object.keys(autoResults).length}/{autoSequence.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowVisualization;
