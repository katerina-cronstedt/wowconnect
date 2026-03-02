import { motion } from "framer-motion";

export default function GalaPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Event</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">WOW-Galan</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          WOW-Galan är vår årliga gala där vi firar framgångar, tackar våra sponsorer och lyfter fram de kvinnor som tagit steget in i arbetslivet. Mer information om kommande gala publiceras här.
        </p>
      </motion.div>
    </div>
  );
}
