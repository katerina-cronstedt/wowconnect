import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";

const cityData: Record<string, { name: string; description: string }> = {
  boras: { name: "Borås", description: "WOW Borås samlar kvinnor i Sjuhäradsbygden för luncher och nätverkande." },
  goteborg: { name: "Göteborg", description: "WOW Göteborg är en av våra största städer med regelbundna luncher och OneGoal-program." },
  halmstad: { name: "Halmstad", description: "WOW Halmstad skapar möten och möjligheter längs Hallandskusten." },
  helsingborg: { name: "Helsingborg", description: "WOW Helsingborg bygger broar mellan kvinnor i nordvästra Skåne." },
  karlstad: { name: "Karlstad", description: "WOW Karlstad samlar kvinnor i Värmland för integration och gemenskap." },
  stockholm: { name: "Stockholm", description: "WOW Stockholm verkar i huvudstaden med ett stort nätverk av engagerade kvinnor." },
};

export default function CityPage() {
  const { slug } = useParams();
  const city = slug ? cityData[slug] : null;

  if (!city) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-serif text-foreground mb-4">Staden hittades inte</h1>
        <Link to="/" className="text-primary hover:underline">Tillbaka till startsidan</Link>
      </div>
    );
  }

  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-accent mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-serif italic text-lg">{city.name}</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-6">WOW {city.name}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12">{city.description}</p>

        <div className="bg-wow-blue-soft rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif text-foreground">Kommande luncher</h2>
          </div>
          <p className="text-muted-foreground">Inga kommande evenemang just nu. Gå med för att få notiser om nya luncher!</p>
          <Link
            to="/join"
            className="inline-block mt-6 bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Anmäl dig
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
