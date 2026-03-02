import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function EngagePage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Engagera dig</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">Gör skillnad med WOW</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          Det finns många sätt att bidra till integration. Oavsett om du har en timme eller tio – ditt engagemang gör skillnad.
        </p>
        <div className="space-y-6">
          {[
            { title: "Delta på en WOW-lunch", desc: "Träffa nya vänner och bidra till integration över en gemensam lunch." },
            { title: "Bli mentor i OneGoal", desc: "Dela din erfarenhet och hjälp en kvinna in i arbetslivet." },
            { title: "Volontär", desc: "Hjälp oss med event, kommunikation eller administration." },
            { title: "Sponsra WOW", desc: "Stöd vår verksamhet som företags- eller privatsponsor." },
          ].map((item) => (
            <div key={item.title} className="border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <h3 className="text-lg font-serif text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/join" className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity">
            Gå med idag
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
