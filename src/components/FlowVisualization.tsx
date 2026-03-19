import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playBonk, playWhoosh } from "@/lib/sounds";

const pipeOptions = [
  { key: "tiny", label: '⅜"', diameter: 28, mm: "9.5mm", fits: false },
  { key: "small", label: '½"', diameter: 40, mm: "12.7mm", fits: false },
  { key: "medium", label: '¾"', diameter: 64, mm: "19.05mm", fits: true },
  { key: "large", label: '1"', diameter: 80, mm: "25.4mm", fits: true },
] as const;

type PipeKey = (typeof pipeOptions)[number]["key"];

const FlowVisualization = () => {
  const [flowing, setFlowing] = useState(false);
  const [pipeSize, setPipeSize] = useState<PipeKey>("small");
  const [loop, setLoop] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const loopRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const pipe = pipeOptions.find((p) => p.key === pipeSize)!;
  const fits = pipe.fits;
  const duration = fits ? 2 / speed : 1 / speed;

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleFlow = () => {
    setFlowing(true);
    const sfxDelay = fits ? (1200 / speed) : (900 / speed);
    setTimeout(() => {
      if (fits) playWhoosh();
      else playBonk();
    }, sfxDelay);
    timeoutRef.current = setTimeout(() => {
      setFlowing(false);
      if (loopRef.current) {
        timeoutRef.current = setTimeout(() => handleFlow(), 400);
      }
    }, (fits ? 2200 : 1200) / speed);
  };

  const handleStop = () => {
    setLoop(false);
    loopRef.current = false;
    setFlowing(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <div className="space-y-5">
      {/* Pipe size toggle */}
      <div className="flex flex-wrap justify-center gap-2">
        {pipeOptions.map((p) => (
          <motion.button
            key={p.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setPipeSize(p.key); handleStop(); }}
            className={`rounded-xl border-[3px] px-3 py-2 font-display font-semibold text-xs transition-colors duration-150 ${
              pipeSize === p.key
                ? p.fits
                  ? "border-lego-green bg-primary text-primary-foreground"
                  : "border-destructive bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {p.label} ({p.mm})
          </motion.button>
        ))}
      </div>

      {/* Speed & loop controls */}
      <div className="flex justify-center items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-display text-muted-foreground">Speed:</span>
          {([1, 2, 3] as const).map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSpeed(s)}
              className={`w-7 h-7 rounded-lg border-2 font-display font-bold text-[10px] transition-colors ${
                speed === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {s}×
            </motion.button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLoop(!loop)}
          className={`rounded-lg border-2 px-2.5 py-1 font-display font-semibold text-[10px] transition-colors ${
            loop
              ? "border-lego-blue bg-lego-blue text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          🔁 Loop {loop ? "ON" : "OFF"}
        </motion.button>
      </div>

      {/* Animation stage */}
      <div className="relative h-40 overflow-hidden rounded-2xl bg-muted/50 border-2 border-border">
        {/* Pipe walls */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex flex-col justify-center pointer-events-none">
          <motion.div
            animate={{ height: pipe.diameter }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-40 mx-auto"
          >
            <div className="absolute -top-3 left-0 right-0 h-3 bg-muted-foreground/20 rounded-t-lg" />
            <div className="absolute -bottom-3 left-0 right-0 h-3 bg-muted-foreground/20 rounded-b-lg" />
            <div className="absolute inset-0 bg-secondary/80 border-y-2 border-muted-foreground/15" />
            {flowing && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration, ease: "easeInOut" }}
                className="absolute inset-0 bg-lego-blue/10"
              />
            )}
          </motion.div>
        </div>

        {/* LEGO Molecule */}
        <AnimatePresence>
          {flowing && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 flex items-end gap-[1px]"
              initial={{ left: -80 }}
              animate={
                fits
                  ? { left: ["-80px", "45%", "calc(100% + 80px)"] }
                  : { left: ["-80px", "38%", "38%"], rotate: [0, 0, 8, -8, 5, -5, 0] }
              }
              transition={
                fits
                  ? { duration, ease: "easeInOut", times: [0, 0.4, 1] }
                  : { duration, ease: "easeOut" }
              }
            >
              <div className="flex flex-col items-center" style={{ transform: "rotate(15deg)", transformOrigin: "right bottom" }}>
                <div className="w-3 h-3 rounded-full bg-card border-2 border-border shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]" />
                <div className="w-[2px] h-3 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="relative">
                <div className="w-10 h-7 bg-lego-red rounded-md shadow-[0_2px_0_0_rgba(0,0,0,0.15)]" />
                <div className="absolute -top-1 left-1 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-lego-red shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-lego-red shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
                </div>
              </div>
              <div className="flex flex-col items-center" style={{ transform: "rotate(-15deg)", transformOrigin: "left bottom" }}>
                <div className="w-3 h-3 rounded-full bg-card border-2 border-border shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]" />
                <div className="w-[2px] h-3 bg-muted-foreground/30 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stuck indicator */}
        <AnimatePresence>
          {flowing && !fits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.9 / speed }}
              className="absolute top-2 right-3 font-display font-bold text-destructive text-sm"
            >
              STUCK! 🧱💥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fit indicator */}
        <div className={`absolute top-2 left-3 text-[10px] font-display font-bold ${fits ? "text-lego-green" : "text-destructive"}`}>
          {fits ? "✅ FITS" : "❌ TOO SMALL"}
        </div>

        <div className="absolute bottom-2 left-3 text-[10px] font-body text-muted-foreground">
          Pipe: {pipe.label} ({pipe.mm})
        </div>
      </div>

      {/* Flow button */}
      <div className="flex justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleFlow}
          disabled={flowing}
          className="rounded-xl border-[3px] border-lego-yellow bg-lego-yellow px-6 py-2.5 font-display font-bold text-sm text-accent-foreground disabled:opacity-40 transition-colors duration-150"
        >
          {flowing ? "Flowing..." : "💧 Send It!"}
        </motion.button>
        {flowing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="rounded-xl border-[3px] border-destructive bg-destructive px-4 py-2.5 font-display font-bold text-sm text-destructive-foreground transition-colors duration-150"
          >
            Stop
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FlowVisualization;
