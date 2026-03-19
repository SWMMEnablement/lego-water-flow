import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LEGO_MOLECULE_WIDTH_MM = 15.8; // approx width of a 2x1 LEGO brick

const pipeOptions = [
  { label: '½" Pipe', diameter: 12.7, inches: "½″" },
  { label: '¾" Pipe', diameter: 19.05, inches: "¾″" },
  { label: '1" Pipe', diameter: 25.4, inches: "1″" },
  { label: '1¼" Pipe', diameter: 31.75, inches: "1¼″" },
];

const PipeSizer = () => {
  const [selected, setSelected] = useState(1);
  const pipe = pipeOptions[selected];
  const fits = pipe.diameter >= LEGO_MOLECULE_WIDTH_MM;

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3 flex-wrap">
        {pipeOptions.map((p, i) => (
          <motion.button
            key={p.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(i)}
            className={`rounded-xl border-[3px] px-4 py-2 font-display font-semibold text-sm transition-colors duration-150 ${
              selected === i
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
            }`}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-8">
        {/* Pipe cross-section */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ width: pipe.diameter * 3, height: pipe.diameter * 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-full border-[4px] border-muted-foreground/30 bg-secondary flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {fits ? (
                <motion.div
                  key="fits"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="rounded-sm bg-lego-red"
                  style={{ width: LEGO_MOLECULE_WIDTH_MM * 2.5, height: LEGO_MOLECULE_WIDTH_MM * 1.5 }}
                />
              ) : (
                <motion.div
                  key="no-fit"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="rounded-sm bg-lego-red opacity-50"
                  style={{ width: LEGO_MOLECULE_WIDTH_MM * 2.5, height: LEGO_MOLECULE_WIDTH_MM * 1.5 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          <span className="font-body text-sm text-muted-foreground">
            Ø {pipe.diameter.toFixed(1)}mm ({pipe.inches})
          </span>
        </div>

        {/* Result */}
        <motion.div
          key={selected}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="text-center"
        >
          <div
            className={`font-display text-3xl font-bold ${
              fits ? "text-lego-green" : "text-destructive"
            }`}
          >
            {fits ? "IT FITS! ✓" : "TOO SMALL ✗"}
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            LEGO molecule: ~{LEGO_MOLECULE_WIDTH_MM}mm wide
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PipeSizer;
