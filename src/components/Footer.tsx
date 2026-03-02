import { Link } from "react-router-dom";
import wowLogo from "@/assets/wow-logo.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <img src={wowLogo} alt="WOW Foundation" className="h-12 w-auto brightness-200 mb-4" />
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Integration startar med dig och mig. Tillsammans är vi en del av lösningen.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Organisation</h4>
            <ul className="space-y-2.5">
              <li><Link to="/om-oss" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Om oss</Link></li>
              <li><Link to="/engagera-dig" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Engagera dig</Link></li>
              <li><Link to="/wow-galan" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">WOW-Galan</Link></li>
              <li><Link to="/kontakt" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Program</h4>
            <ul className="space-y-2.5">
              <li><Link to="/onegoal" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">OneGoal</Link></li>
              <li><Link to="/stader/goteborg" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">WOW-Luncher</Link></li>
              <li><Link to="/join" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Bli medlem</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Städer</h4>
            <ul className="space-y-2.5">
              {["Borås", "Göteborg", "Halmstad", "Helsingborg", "Karlstad", "Stockholm"].map((city) => (
                <li key={city}>
                  <Link to={`/stader/${city.toLowerCase().replace("ö", "o").replace("å", "a")}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-xs text-primary-foreground/40">© {new Date().getFullYear()} WOW Foundation. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}
