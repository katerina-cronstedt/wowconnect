import { motion } from "framer-motion";

export default function OneGoalMentorsPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">OneGoal</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">För mentorer</h1>
        <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
          <p>Som mentor i OneGoal delar du med dig av din erfarenhet och ditt nätverk för att hjälpa en kvinna att ta steget in på arbetsmarknaden.</p>
          <p>Det krävs cirka 30 timmar under 4 månader. Du får stöd och utbildning från WOW under hela processen.</p>
        </div>
      </motion.div>
    </div>
  );
}
