import { motion } from "framer-motion";

export default function OneGoalCandidatesPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">OneGoal</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">För kandidater</h1>
        <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
          <p>Är du en kvinna med utländsk bakgrund som vill komma in på den svenska arbetsmarknaden? OneGoal kan hjälpa dig!</p>
          <p>Under 4 månader får du personlig handledning av en erfaren mentor som hjälper dig med CV, intervjuträning, nätverkande och förståelse för den svenska arbetsmarknaden.</p>
        </div>
      </motion.div>
    </div>
  );
}
