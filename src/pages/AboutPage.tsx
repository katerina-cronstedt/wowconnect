import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Om oss</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-8">
          Vi skapar integration genom möten
        </h1>
        <div className="prose prose-lg text-muted-foreground space-y-6">
          <p>
            WOW är en ideell organisation som finns i 6 städer i Sverige. Vi arbetar dedikerat och resultatfokuserat för att skapa integration och hjälpa invandrarkvinnor att börja arbeta.
          </p>
          <p>
            WOWs framgång bygger på växelverkan mellan två verksamheter: <strong className="text-foreground">MeetUP</strong> – där kärnverksamheten är WOW-luncher, en mötesplats för kvinnor som annars aldrig hade träffats, och <strong className="text-foreground">OneGoal</strong> – ett en-till-en program som hjälper invandrarkvinnor att gå från arbetslöshet till arbete.
          </p>
          <p>
            Efter 13 år och med över 3 000 deltagare vågar vi säga att vi är bland dem i Sverige som arbetar mest dedikerat för integration.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
