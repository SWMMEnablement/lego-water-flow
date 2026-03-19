import { motion } from "framer-motion";

interface LegoStudProps {
  color: "blue" | "red" | "yellow" | "green";
  size?: number;
  delay?: number;
}

const colorMap = {
  blue: "bg-lego-blue",
  red: "bg-lego-red",
  yellow: "bg-lego-yellow",
  green: "bg-lego-green",
};

const LegoStud = ({ color, size = 24, delay = 0 }: LegoStudProps) => (
  <motion.div
    initial={{ scale: 0, y: -10 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 500, damping: 20, delay }}
    className={`${colorMap[color]} rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]`}
    style={{ width: size, height: size }}
  />
);

export default LegoStud;
