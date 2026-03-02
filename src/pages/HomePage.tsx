import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, Briefcase, Clock, Target, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-women.jpg";

const stats = [
  { icon: MapPin, value: "6", label: "WOW-städer" },
  { icon: Users, value: "3 012", label: "WOW-are" },
  { icon: Briefcase, value: "194", label: "Jobb via OneGoal" },
  { icon: TrendingUp, value: "38 MSEK", label: "Värde i pengar för 180 personer" },
  { icon: Clock, value: "13 år", label: "Sedan start 2012" },
  { icon: Target, value: "75%", label: "Success-rate för OneGoal" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-serif italic text-lg lg:text-xl mb-3">
              Integration startar med dig och mig
            </p>
            <h1 className="text-4xl lg:text-6xl font-serif leading-tight text-foreground mb-6 text-balance">
              Tillsammans är vi en del av lösningen
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              WOW är en ideell organisation som finns i 5 städer. Efter 12 år och med över 2 500 deltagare vågar vi säga att vi är bland dem i Sverige som arbetar mest dedikerat och resultatfokuserat för att skapa integration och för att få invandrarkvinnor att börja arbeta.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/join"
                className="bg-accent text-accent-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Join Us
              </Link>
              <Link
                to="/om-oss"
                className="border border-border text-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-muted transition-colors"
              >
                Läs mer
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Kvinnor vid WOW-lunch"
                className="w-full h-[350px] lg:h-[480px] object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-wow-pink-soft rounded-full -z-10" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-wow-blue-soft rounded-full -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <p className="text-accent font-serif italic text-lg mb-2">Våra verksamheter</p>
          <h2 className="text-3xl lg:text-4xl font-serif text-foreground mb-12">Två program, ett mål</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-wow-blue-soft p-8 lg:p-10 rounded-2xl"
            >
              <h3 className="text-2xl font-serif text-primary mb-4">MeetUP</h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Kärnverksamheten är WOW-luncher – en mötesplats för kvinnor som annars aldrig hade träffats: etablerade svenskor och invandrarkvinnor.
              </p>
              <Link to="/stader/goteborg" className="text-primary font-semibold text-sm hover:underline">
                Se kommande luncher →
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-wow-pink-soft p-8 lg:p-10 rounded-2xl"
            >
              <h3 className="text-2xl font-serif text-accent mb-4">OneGoal</h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                I OneGoal programmet arbetar vi en-till-en enligt en väl etablerad process där vi hjälper invandrarkvinnor att börja arbeta. Med 30 timmar, under en 4-månaders period, går över 75% av kandidaterna från arbetslöshet till arbete.
              </p>
              <Link to="/onegoal" className="text-accent font-semibold text-sm hover:underline">
                Läs mer om OneGoal →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent py-16 lg:py-20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent-foreground/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-serif text-accent-foreground">{stat.value}</p>
                  <p className="text-accent-foreground/70 text-sm mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container text-center max-w-2xl">
          <p className="text-accent font-serif italic text-lg mb-2">Var med och gör skillnad</p>
          <h2 className="text-3xl lg:text-5xl font-serif text-foreground mb-6">Bli en del av WOW</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Oavsett om du vill delta på en lunch, bli mentor eller hitta din väg in i arbetslivet – det finns en plats för dig hos WOW.
          </p>
          <Link
            to="/join"
            className="inline-block bg-accent text-accent-foreground px-10 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Gå med idag
          </Link>
        </div>
      </section>
    </>
  );
}
