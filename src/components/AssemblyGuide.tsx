import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Grab the Oxygen Brick",
    description: "Find a red 2×2 LEGO brick. This will be the oxygen atom — the heart of your water molecule.",
    visual: (
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="relative"
        >
          <div className="w-20 h-14 bg-lego-red rounded-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)]" />
          <div className="absolute -top-2 left-2 flex gap-3">
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2),0_-1px_0_rgba(255,255,255,0.3)]" />
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2),0_-1px_0_rgba(255,255,255,0.3)]" />
          </div>
          <div className="absolute -top-2 left-2 top-2 flex gap-3" style={{ top: "-8px", left: "32px" }}>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Attach Hydrogen #1",
    description: "Take a white 1×1 round brick. Snap it onto the left side of the oxygen brick at a 104.5° angle.",
    visual: (
      <div className="flex justify-center items-end gap-1">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex flex-col items-center"
          style={{ transform: "rotate(15deg)", transformOrigin: "right bottom" }}
        >
          <div className="w-4 h-4 rounded-full bg-card border-2 border-border shadow-[inset_0_-2px_3px_rgba(0,0,0,0.1)]" />
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </motion.div>
        <div className="relative">
          <div className="w-20 h-14 bg-lego-red rounded-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)]" />
          <div className="absolute -top-2 left-2 flex gap-3">
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Attach Hydrogen #2",
    description: "Take another white 1×1 round brick. Snap it onto the right side, mirroring the first hydrogen.",
    visual: (
      <div className="flex justify-center items-end gap-1">
        <motion.div
          className="flex flex-col items-center"
          style={{ transform: "rotate(15deg)", transformOrigin: "right bottom" }}
        >
          <div className="w-4 h-4 rounded-full bg-card border-2 border-border shadow-[inset_0_-2px_3px_rgba(0,0,0,0.1)]" />
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </motion.div>
        <div className="relative">
          <div className="w-20 h-14 bg-lego-red rounded-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)]" />
          <div className="absolute -top-2 left-2 flex gap-3">
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex flex-col items-center"
          style={{ transform: "rotate(-15deg)", transformOrigin: "left bottom" }}
        >
          <div className="w-4 h-4 rounded-full bg-card border-2 border-border shadow-[inset_0_-2px_3px_rgba(0,0,0,0.1)]" />
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </motion.div>
      </div>
    ),
  },
  {
    id: 4,
    title: "H₂O Complete! 💧",
    description: "Your LEGO water molecule is ready! Total size: ~31.6 × 15.8 × 11.4 mm. Now find a pipe big enough!",
    visual: (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.4, times: [0, 0.5, 1] }}
        className="flex justify-center items-end gap-1"
      >
        <div
          className="flex flex-col items-center"
          style={{ transform: "rotate(15deg)", transformOrigin: "right bottom" }}
        >
          <div className="w-4 h-4 rounded-full bg-card border-2 border-border shadow-[inset_0_-2px_3px_rgba(0,0,0,0.1)]" />
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </div>
        <div className="relative">
          <div className="w-20 h-14 bg-lego-red rounded-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)]" />
          <div className="absolute -top-2 left-2 flex gap-3">
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
            <div className="w-5 h-5 rounded-full bg-lego-red shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
        <div
          className="flex flex-col items-center"
          style={{ transform: "rotate(-15deg)", transformOrigin: "left bottom" }}
        >
          <div className="w-4 h-4 rounded-full bg-card border-2 border-border shadow-[inset_0_-2px_3px_rgba(0,0,0,0.1)]" />
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </div>
      </motion.div>
    ),
  },
];

const AssemblyGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {steps.map((s, i) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentStep(i)}
            aria-current={i === currentStep ? "step" : undefined}
            aria-label={`Go to step ${s.id}: ${s.title}`}
            className={`w-10 h-10 rounded-xl font-display font-bold text-sm border-[3px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lego-yellow focus-visible:ring-offset-2 ${
              i === currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : i < currentStep
                ? "border-lego-green bg-lego-green text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {i < currentStep ? "✓" : s.id}
          </motion.button>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {/* Visual */}
          <div className="h-28 flex items-center justify-center">
            {steps[currentStep].visual}
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h4 className="font-display text-xl font-bold text-foreground">
              Step {steps[currentStep].id}: {steps[currentStep].title}
            </h4>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {steps[currentStep].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="rounded-xl border-[3px] border-border bg-card px-5 py-2 font-display font-semibold text-sm text-foreground disabled:opacity-30 transition-colors duration-150 hover:border-primary/50"
        >
          ← Back
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={currentStep === steps.length - 1}
          className="rounded-xl border-[3px] border-lego-yellow bg-lego-yellow px-5 py-2 font-display font-semibold text-sm text-accent-foreground disabled:opacity-30 transition-colors duration-150"
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
};

export default AssemblyGuide;
