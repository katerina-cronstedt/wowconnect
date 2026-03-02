import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function OneGoalPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Program</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">OneGoal</h1>
        <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
          <p>
            I OneGoal programmet arbetar vi en-till-en enligt en väl etablerad process där vi hjälper invandrarkvinnor att börja arbeta.
          </p>
          <p>
            Med 30 timmar, under en 4-månaders period, går över <strong className="text-foreground">75% av kandidaterna</strong> från arbetslöshet till arbete.
          </p>
          <p>
            Programmet matchar en kandidat med en erfaren mentor som guidar genom hela processen – från CV och intervjuteknik till nätverkande och arbetsmarknadens koder.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link to="/onegoal/kandidater" className="bg-wow-pink-soft p-8 rounded-2xl hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-serif text-accent mb-2">För kandidater</h3>
            <p className="text-muted-foreground text-sm">Vill du ha hjälp att komma in på arbetsmarknaden?</p>
          </Link>
          <Link to="/onegoal/mentorer" className="bg-wow-blue-soft p-8 rounded-2xl hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-serif text-primary mb-2">För mentorer</h3>
            <p className="text-muted-foreground text-sm">Vill du dela med dig av din erfarenhet och göra skillnad?</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
