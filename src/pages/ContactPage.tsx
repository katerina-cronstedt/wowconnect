import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Kontakt</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">Kontakta oss</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          Har du frågor om WOW eller vill du samarbeta med oss? Hör gärna av dig!
        </p>
        <div className="bg-wow-blue-soft rounded-2xl p-8">
          <p className="text-foreground font-medium">E-post</p>
          <a href="mailto:info@wowfoundation.se" className="text-primary hover:underline">info@wowfoundation.se</a>
        </div>
      </motion.div>
    </div>
  );
}
