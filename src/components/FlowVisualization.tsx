import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FlowVisualization = () => {
  const [flowing, setFlowing] = useState(false);
  const [pipeSize, setPipeSize] = useState<"small" | "big">("small");

  const pipeDiameter = pipeSize === "small" ? 40 : 64;
  const moleculeWidth = 48;
  const fits = pipeDiameter >= moleculeWidth;

  const handleFlow = () => {
    setFlowing(true);
    setTimeout(() => setFlowing(false), fits ? 2200 : 1200);
  };

  return (
    <div className="space-y-5">
      {/* Pipe size toggle */}
      <div className="flex justify-center gap-3">
        {([
          { key: "small" as const, label: '½" Pipe (too small)', color: "border-destructive" },
          { key: "big" as const, label: '¾" Pipe (fits!)', color: "border-lego-green" },
        ]).map((p) => (
          <motion.button
            key={p.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setPipeSize(p.key); setFlowing(false); }}
            className={`rounded-xl border-[3px] px-3 py-2 font-display font-semibold text-xs transition-colors duration-150 ${
              pipeSize === p.key
                ? `${p.color} bg-primary text-primary-foreground`
                : "border-border bg-card text-foreground"
            }`}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Animation stage */}
      <div className="relative h-40 overflow-hidden rounded-2xl bg-muted/50 border-2 border-border">
        {/* Pipe walls */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex flex-col justify-center pointer-events-none">
          <motion.div
            animate={{ height: pipeDiameter }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-40 mx-auto"
          >
            {/* Top pipe wall */}
            <div className="absolute -top-3 left-0 right-0 h-3 bg-muted-foreground/20 rounded-t-lg" />
            {/* Bottom pipe wall */}
            <div className="absolute -bottom-3 left-0 right-0 h-3 bg-muted-foreground/20 rounded-b-lg" />
            {/* Pipe interior */}
            <div className="absolute inset-0 bg-secondary/80 border-y-2 border-muted-foreground/15" />

            {/* Water flow background */}
            {flowing && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: fits ? 2 : 0.8, ease: "easeInOut" }}
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
                  ? { duration: 2, ease: "easeInOut", times: [0, 0.4, 1] }
                  : { duration: 1, ease: "easeOut" }
              }
            >
              {/* Left hydrogen */}
              <div
                className="flex flex-col items-center"
                style={{ transform: "rotate(15deg)", transformOrigin: "right bottom" }}
              >
                <div className="w-3 h-3 rounded-full bg-card border-2 border-border shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]" />
                <div className="w-[2px] h-3 bg-muted-foreground/30 rounded-full" />
              </div>
              {/* Oxygen */}
              <div className="relative">
                <div className="w-10 h-7 bg-lego-red rounded-md shadow-[0_2px_0_0_rgba(0,0,0,0.15)]" />
                <div className="absolute -top-1 left-1 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-lego-red shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-lego-red shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
                </div>
              </div>
              {/* Right hydrogen */}
              <div
                className="flex flex-col items-center"
                style={{ transform: "rotate(-15deg)", transformOrigin: "left bottom" }}
              >
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
              transition={{ delay: 0.9 }}
              className="absolute top-2 right-3 font-display font-bold text-destructive text-sm"
            >
              STUCK! 🧱💥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Labels */}
        <div className="absolute bottom-2 left-3 text-[10px] font-body text-muted-foreground">
          Pipe: {pipeSize === "small" ? "½″ (12.7mm)" : "¾″ (19.05mm)"}
        </div>
      </div>

      {/* Flow button */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleFlow}
          disabled={flowing}
          className="rounded-xl border-[3px] border-lego-yellow bg-lego-yellow px-6 py-2.5 font-display font-bold text-sm text-accent-foreground disabled:opacity-40 transition-colors duration-150"
        >
          {flowing ? "Flowing..." : "💧 Send It!"}
        </motion.button>
      </div>
    </div>
  );
};

export default FlowVisualization;
