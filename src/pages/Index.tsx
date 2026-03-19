import { motion } from "framer-motion";
import legoMolecule from "@/assets/lego-water-molecule.png";
import legoFaucet from "@/assets/lego-faucet.png";
import BrickCard, { BrickCardHeader, BrickCardBody } from "@/components/BrickCard";
import PipeSizer from "@/components/PipeSizer";
import LegoStud from "@/components/LegoStud";
import AssemblyGuide from "@/components/AssemblyGuide";

const snap = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b-[3px] border-primary bg-primary px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex gap-1">
            <LegoStud color="red" size={16} delay={0} />
            <LegoStud color="yellow" size={16} delay={0.05} />
            <LegoStud color="blue" size={16} delay={0.1} />
            <LegoStud color="green" size={16} delay={0.15} />
          </div>
          <span className="font-display text-sm font-bold uppercase tracking-widest text-primary-foreground">
            TECHNOLOGY 🌸
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-10">
        {/* Title block */}
        <motion.div {...snap} className="text-center space-y-3">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            New Kid at School
          </h1>
          <p className="font-display text-xl text-primary font-semibold">
            Lego Water Molecule
          </p>
          <p className="text-sm text-muted-foreground">
            By <span className="font-semibold text-foreground">LegoMan</span>
          </p>
        </motion.div>

        {/* Hero molecule image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="flex justify-center"
        >
          <img
            src={legoMolecule}
            alt="LEGO water molecule — red oxygen brick with two white hydrogen bricks"
            className="w-64 h-64 object-contain drop-shadow-lg"
          />
        </motion.div>

        {/* PROBLEM card */}
        <BrickCard variant="problem">
          <BrickCardHeader variant="problem">⚠️ THE PROBLEM</BrickCardHeader>
          <BrickCardBody>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={legoFaucet}
                alt="LEGO-style faucet cross-section showing pipe opening"
                className="w-40 h-40 object-contain"
              />
              <div className="space-y-3">
                <p className="font-body text-foreground leading-relaxed">
                  You've built the perfect LEGO water molecule — a <strong>red 2×2 oxygen brick</strong> bonded to two <strong>white 1×1 hydrogen studs</strong>. Beautiful.
                </p>
                <p className="font-body text-foreground leading-relaxed">
                  But now you need to get it through a faucet. Standard kitchen faucets have an internal pipe diameter of only <strong>~12–15mm</strong>. Your LEGO molecule is about <strong>15.8mm wide</strong>.
                </p>
                <p className="font-display font-bold text-destructive text-lg">
                  It won't fit! 🧱💥
                </p>
              </div>
            </div>
          </BrickCardBody>
        </BrickCard>

        {/* SOLUTION card */}
        <BrickCard variant="solution">
          <BrickCardHeader variant="solution">💡 THE SOLUTION</BrickCardHeader>
          <BrickCardBody>
            <div className="space-y-4">
              <p className="font-body text-foreground leading-relaxed">
                Size up your pipes! Use the <strong>Pipe Fit Tester</strong> below to find the minimum pipe diameter that lets your LEGO water molecule flow through freely.
              </p>
              <div className="rounded-xl border-2 border-border bg-muted/50 p-6">
                <h3 className="font-display text-lg font-bold text-foreground text-center mb-4">
                  🔧 Pipe Fit Tester
                </h3>
                <PipeSizer />
              </div>
              <div className="rounded-xl border-2 border-lego-yellow bg-accent/30 p-4">
                <p className="font-display font-bold text-foreground text-center">
                  ✅ Recommendation: Use a <span className="text-lego-green">¾" pipe</span> (19.05mm) or larger!
                </p>
              </div>
            </div>
          </BrickCardBody>
        </BrickCard>

        {/* Specs table */}
        <motion.div {...snap} className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-foreground">📐 Quick Specs</h2>
          <div className="overflow-hidden rounded-2xl border-[3px] border-primary">
            <table className="w-full font-body text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-4 py-3 text-left font-display font-bold">Component</th>
                  <th className="px-4 py-3 text-left font-display font-bold">Dimension</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["LEGO 2×2 Brick (Oxygen)", "15.8 × 15.8 × 11.4 mm"],
                  ["LEGO 1×1 Round (Hydrogen)", "Ø 8.0 × 11.4 mm"],
                  ["Assembled H₂O Molecule", "~31.6 × 15.8 × 11.4 mm"],
                  ["Standard ½\" Pipe ID", "Ø 12.7 mm"],
                  ["Recommended ¾\" Pipe ID", "Ø 19.05 mm"],
                ].map(([component, dimension], i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/50"}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{component}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{dimension}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-6 space-y-2">
          <div className="flex justify-center gap-1">
            {(["red", "yellow", "blue", "green", "red", "yellow", "blue", "green"] as const).map(
              (c, i) => (
                <LegoStud key={i} color={c} size={12} delay={i * 0.03} />
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Built with 🧱 by LegoMan • Not affiliated with LEGO Group
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
