import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const cities = ["Borås", "Göteborg", "Halmstad", "Helsingborg", "Karlstad", "Stockholm"];

const countries = [
  "Afghanistan", "Albanien", "Algeriet", "Angola", "Argentina", "Armenien", "Azerbajdzjan",
  "Bangladesh", "Bosnien och Herzegovina", "Brasilien", "Bulgarien", "Burma (Myanmar)", "Chile",
  "Colombia", "Ecuador", "Egypten", "Eritrea", "Etiopien", "Filippinerna", "Finland",
  "Frankrike", "Georgien", "Ghana", "Grekland", "Guatemala", "Guinea", "Indien", "Indonesien",
  "Irak", "Iran", "Israel", "Italien", "Japan", "Jordanien", "Kamerun", "Kenya", "Kina",
  "Kongo (DRC)", "Kosovo", "Kroatien", "Kuba", "Kurdistan (region)", "Lettland", "Libanon",
  "Libyen", "Litauen", "Marocko", "Mexiko", "Moldavien", "Montenegro", "Nepal", "Nigeria",
  "Nordmakedonien", "Norge", "Pakistan", "Palestina", "Peru", "Polen", "Portugal", "Rumänien",
  "Ryssland", "Rwanda", "Saudiarabien", "Senegal", "Serbien", "Sierra Leone", "Somalia",
  "Spanien", "Sri Lanka", "Sudan", "Sverige", "Sydafrika", "Sydkorea", "Syrien", "Tadzjikistan",
  "Tanzania", "Thailand", "Tjeckien", "Tunisien", "Turkiet", "Tyskland", "Uganda", "Ukraina",
  "Ungern", "USA", "Uzbekistan", "Venezuela", "Vietnam", "Vitryssland", "Yemen", "Zambia", "Zimbabwe",
  "Annat"
];

const languages = [
  "Svenska", "Engelska", "Arabiska", "Ukrainska", "Ryska", "Persiska", "Somaliska",
  "Spanska", "Franska", "Tigrinja", "Dari", "Pashto", "Kurdiska", "Turkiska",
  "Polska", "Tyska", "Portugisiska", "Italienska"
];

const swedishLevels = [
  { value: "native", label: "Modersmål" },
  { value: "fluent", label: "Flytande" },
  { value: "intermediate", label: "Medel" },
  { value: "beginner", label: "Nybörjare" },
  { value: "test", label: "Jag vill göra ett snabbtest" },
];

const heardOptions = [
  "Vän/mun till mun",
  "Sociala medier",
  "Skola/universitet",
  "Kommun/myndighet",
  "Partnerorganisation",
  "Annat",
];

export default function JoinPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", countryOfOrigin: "", citizenship: "",
    birthday: "", profession: "", swedishLevel: "",
    allergies: "", heardAbout: "", heardAboutOther: "",
    languagesOther: "",
    consentData: false, mediaConsent: "",
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showLangOther, setShowLangOther] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will connect to database later
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container py-20 text-center max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Tack för din anmälan!</h1>
          <p className="text-muted-foreground">Vi hör av oss snart. Välkommen till WOW!</p>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="container py-16 lg:py-24 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent font-serif italic text-lg mb-2">Bli medlem</p>
        <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-4">Gå med i WOW</h1>
        <p className="text-muted-foreground mb-10">Fyll i formuläret nedan för att bli en del av WOW.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Förnamn *</label>
              <input className={inputClass} required value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Efternamn *</label>
              <input className={inputClass} required value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-post *</label>
            <input type="email" className={inputClass} required value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Mobilnummer *</label>
            <input type="tel" className={inputClass} required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>WOW-stad *</label>
            <select className={inputClass} required value={form.city} onChange={(e) => updateField("city", e.target.value)}>
              <option value="">Välj stad</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ursprungsland *</label>
              <select className={inputClass} required value={form.countryOfOrigin} onChange={(e) => updateField("countryOfOrigin", e.target.value)}>
                <option value="">Välj land</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Medborgarskap *</label>
              <select className={inputClass} required value={form.citizenship} onChange={(e) => updateField("citizenship", e.target.value)}>
                <option value="">Välj land</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Födelsedag *</label>
            <input type="date" className={inputClass} required value={form.birthday} onChange={(e) => updateField("birthday", e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Yrke *</label>
            <input className={inputClass} required value={form.profession} onChange={(e) => updateField("profession", e.target.value)} />
          </div>

          {/* Languages */}
          <div>
            <label className={labelClass}>Språk *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedLanguages.includes(lang)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground/70 border-border hover:border-primary/40"
                  }`}
                >
                  {lang}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowLangOther(!showLangOther)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  showLangOther
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground/70 border-border hover:border-primary/40"
                }`}
              >
                Annat
              </button>
            </div>
            {showLangOther && (
              <input className={`${inputClass} mt-2`} placeholder="Ange andra språk" value={form.languagesOther} onChange={(e) => updateField("languagesOther", e.target.value)} />
            )}
          </div>

          {/* Swedish level */}
          <div>
            <label className={labelClass}>Svenskanivå *</label>
            <select className={inputClass} required value={form.swedishLevel} onChange={(e) => updateField("swedishLevel", e.target.value)}>
              <option value="">Välj nivå</option>
              {swedishLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Allergies */}
          <div>
            <label className={labelClass}>Matallergier / kostpreferenser</label>
            <input className={inputClass} value={form.allergies} onChange={(e) => updateField("allergies", e.target.value)} placeholder="T.ex. glutenfritt, vegetariskt" />
          </div>

          {/* How did you hear */}
          <div>
            <label className={labelClass}>Hur hörde du om WOW?</label>
            <select className={inputClass} value={form.heardAbout} onChange={(e) => updateField("heardAbout", e.target.value)}>
              <option value="">Välj</option>
              {heardOptions.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            {form.heardAbout === "Annat" && (
              <input className={`${inputClass} mt-2`} placeholder="Berätta mer" value={form.heardAboutOther} onChange={(e) => updateField("heardAboutOther", e.target.value)} />
            )}
          </div>

          {/* Consent */}
          <div className="space-y-4 pt-4 border-t border-border">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.consentData}
                onChange={(e) => updateField("consentData", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-ring"
              />
              <span className="text-sm text-foreground/80">
                Jag samtycker till att WOW lagrar och behandlar mina personuppgifter enligt GDPR. *
              </span>
            </label>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Samtycker du till att ditt namn, bild och röst används i WOWs kommunikation?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaConsent" value="yes" onChange={(e) => updateField("mediaConsent", e.target.value)} className="text-primary focus:ring-ring" />
                  <span className="text-sm text-foreground/80">Ja</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaConsent" value="no" onChange={(e) => updateField("mediaConsent", e.target.value)} className="text-primary focus:ring-ring" />
                  <span className="text-sm text-foreground/80">Nej</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-accent-foreground py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Skicka anmälan
          </button>
        </form>
      </motion.div>
    </div>
  );
}
