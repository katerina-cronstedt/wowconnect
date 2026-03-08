import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import wowLogo from "@/assets/wow-logo.png";

const cities = [
  { name: "Borås", slug: "boras" },
  { name: "Göteborg", slug: "goteborg" },
  { name: "Halmstad", slug: "halmstad" },
  { name: "Helsingborg", slug: "helsingborg" },
  { name: "Karlstad", slug: "karlstad" },
  { name: "Stockholm", slug: "stockholm" },
];

interface DropdownProps {
  label: string;
  items: { name: string; to: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

const NavDropdown = ({ label, items, isOpen, onToggle }: DropdownProps) => {
  const location = useLocation();
  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-foreground/80 hover:text-primary font-medium text-sm tracking-wide transition-colors py-2"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-lg border border-border py-2 min-w-[200px] z-50"
          >
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                  location.pathname === item.to ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const cityItems = cities.map((c) => ({ name: c.name, to: `/stader/${c.slug}` }));

  const oneGoalItems = [
    { name: "Om OneGoal", to: "/onegoal" },
    { name: "För kandidater", to: "/onegoal/kandidater" },
    { name: "För mentorer", to: "/onegoal/mentorer" },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="container flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex-shrink-0">
          <img src={wowLogo} alt="WOW Foundation" className="h-12 lg:h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/om-oss" className="text-foreground/80 hover:text-primary font-medium text-sm tracking-wide transition-colors">
            Om oss
          </Link>
          <NavDropdown
            label="Städer & Luncher"
            items={cityItems}
            isOpen={openDropdown === "cities"}
            onToggle={() => toggleDropdown("cities")}
          />
          <NavDropdown
            label="OneGoal"
            items={oneGoalItems}
            isOpen={openDropdown === "onegoal"}
            onToggle={() => toggleDropdown("onegoal")}
          />
          <Link to="/engagera-dig" className="text-foreground/80 hover:text-primary font-medium text-sm tracking-wide transition-colors">
            Engagera dig
          </Link>
          <Link to="/wow-galan" className="text-foreground/80 hover:text-primary font-medium text-sm tracking-wide transition-colors">
            WOW-Galan
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/admin/login"
            className="text-foreground/60 hover:text-primary font-medium text-sm transition-colors"
          >
            Logga in
          </Link>
          <Link
            to="/join"
            className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Join Us
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-foreground">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="container py-4 space-y-2">
              <Link to="/om-oss" className="block py-2 text-foreground/80 font-medium" onClick={() => setMobileOpen(false)}>Om oss</Link>
              <div>
                <button onClick={() => toggleDropdown("m-cities")} className="flex items-center gap-1 py-2 text-foreground/80 font-medium w-full">
                  Städer & Luncher <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "m-cities" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "m-cities" && (
                  <div className="pl-4 space-y-1">
                    {cityItems.map((item) => (
                      <Link key={item.to} to={item.to} className="block py-1.5 text-sm text-foreground/70" onClick={() => setMobileOpen(false)}>{item.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => toggleDropdown("m-onegoal")} className="flex items-center gap-1 py-2 text-foreground/80 font-medium w-full">
                  OneGoal <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "m-onegoal" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "m-onegoal" && (
                  <div className="pl-4 space-y-1">
                    {oneGoalItems.map((item) => (
                      <Link key={item.to} to={item.to} className="block py-1.5 text-sm text-foreground/70" onClick={() => setMobileOpen(false)}>{item.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/engagera-dig" className="block py-2 text-foreground/80 font-medium" onClick={() => setMobileOpen(false)}>Engagera dig</Link>
              <Link to="/wow-galan" className="block py-2 text-foreground/80 font-medium" onClick={() => setMobileOpen(false)}>WOW-Galan</Link>
              <Link to="/join" className="inline-block mt-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-semibold text-sm" onClick={() => setMobileOpen(false)}>Join Us</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
