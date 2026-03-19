import { useState } from "react";
import { motion } from "framer-motion";

const parts = [
  { id: "oxygen", name: "2×2 Brick", color: "Red", colorClass: "bg-lego-red", qty: 1, code: "3003" },
  { id: "h1", name: "1×1 Round Plate", color: "White", colorClass: "bg-card border-2 border-border", qty: 2, code: "6141" },
  { id: "bond", name: "Connector Pin", color: "Light Gray", colorClass: "bg-muted-foreground/30", qty: 2, code: "2780" },
];

const PartsInventory = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const allChecked = parts.every((p) => checked[p.id]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {parts.map((part, i) => (
          <motion.button
            key={part.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => toggle(part.id)}
            className={`w-full flex items-center gap-3 rounded-xl border-[3px] px-4 py-3 text-left transition-colors duration-150 ${
              checked[part.id]
                ? "border-lego-green bg-lego-green/5"
                : "border-border bg-card"
            }`}
          >
            {/* Checkbox */}
            <div
              className={`w-6 h-6 rounded-lg border-[3px] flex items-center justify-center shrink-0 transition-colors duration-150 ${
                checked[part.id]
                  ? "border-lego-green bg-lego-green"
                  : "border-muted-foreground/30 bg-card"
              }`}
            >
              {checked[part.id] && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="text-primary-foreground text-xs font-bold"
                >
                  ✓
                </motion.span>
              )}
            </div>

            {/* Color swatch */}
            <div className={`w-8 h-8 rounded-lg ${part.colorClass} shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)] shrink-0`} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm text-foreground">
                {part.name}
              </div>
              <div className="text-xs text-muted-foreground font-body">
                {part.color} · Part #{part.code}
              </div>
            </div>

            {/* Quantity */}
            <div className="font-display font-bold text-lg text-foreground shrink-0">
              ×{part.qty}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Summary */}
      <div className={`rounded-xl border-[3px] px-4 py-3 text-center font-display font-bold text-sm transition-colors duration-150 ${
        allChecked
          ? "border-lego-green bg-lego-green/10 text-lego-green"
          : "border-border bg-muted/50 text-muted-foreground"
      }`}>
        {allChecked
          ? "✅ All parts collected! Ready to build!"
          : `${parts.filter((p) => checked[p.id]).length} / ${parts.length} parts collected`}
      </div>
    </div>
  );
};

export default PartsInventory;
