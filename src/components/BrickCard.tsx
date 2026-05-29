import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BrickCardProps {
  children: ReactNode;
  variant?: "default" | "problem" | "solution";
  className?: string;
}

const borderColors = {
  default: "border-primary",
  problem: "border-destructive",
  solution: "border-lego-yellow",
};

const headerColors = {
  default: "bg-primary",
  problem: "bg-destructive",
  solution: "bg-lego-yellow",
};

const BrickCard = ({ children, variant = "default", className = "" }: BrickCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`rounded-2xl border-[3px] ${borderColors[variant]} bg-card overflow-hidden shadow-[0_4px_0_0_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </motion.div>
);

export const BrickCardHeader = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "problem" | "solution";
}) => (
  <h2
    className={`${headerColors[variant]} px-6 py-3 font-display text-lg font-bold tracking-wide m-0 ${
      variant === "solution" ? "text-accent-foreground" : "text-primary-foreground"
    }`}
  >
    {children}
  </h2>
);

export const BrickCardBody = ({ children }: { children: ReactNode }) => (
  <div className="p-6">{children}</div>
);

export default BrickCard;
