import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { formOptions } from "@/config/formOptions";

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
              {formOptions.cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ursprungsland *</label>
              <select className={inputClass} required value={form.countryOfOrigin} onChange={(e) => updateField("countryOfOrigin", e.target.value)}>
                <option value="">Välj land</option>
                {formOptions.countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Medborgarskap *</label>
              <select className={inputClass} required value={form.citizenship} onChange={(e) => updateField("citizenship", e.target.value)}>
                <option value="">Välj land</option>
                {formOptions.countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Födelsedag *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`${inputClass} flex items-center justify-between text-left font-normal ${!form.birthday && "text-muted-foreground"}`}
                >
                  {form.birthday ? format(new Date(form.birthday), "yyyy-MM-dd") : <span>ÅÅÅÅ-MM-DD</span>}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.birthday ? new Date(form.birthday) : undefined}
                  onSelect={(date) => updateField("birthday", date ? format(date, "yyyy-MM-dd") : "")}
                  defaultMonth={new Date(1990, 0)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className={labelClass}>Yrke *</label>
            <input className={inputClass} required value={form.profession} onChange={(e) => updateField("profession", e.target.value)} />
          </div>

          {/* Languages */}
          <div>
            <label className={labelClass}>Språk *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {formOptions.languages.map((lang) => (
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
              {formOptions.swedishLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
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
              {formOptions.heardOptions.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            {form.heardAbout === "Annat" && (
              <input className={`${inputClass} mt-2`} placeholder="Berätta mer" value={form.heardAboutOther} onChange={(e) => updateField("heardAboutOther", e.target.value)} />
            )}
          </div>

          {/* Consent */}
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-semibold">GDPR</h3>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.consentData}
                  onChange={(e) => updateField("consentData", e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-ring"
                />
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <strong>Samtycke till att Women On Wednesday {form.city} behandlar mina personuppgifter</strong><br />
                  Jag tillåter WOW att spara personliga uppgifter om mig så som namn, adress, telefonnummer, ålder, nationalitet, etc. *
                </div>
              </label>

              <div className="pt-2">
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  Jag ger till Women on Wednesday (WOW) min tillåtelse att använda mitt namn, bild eller röst i sina kommunikationer. Jag förstår att bilderna kan användas i online-publikationer, tryckta publikationer, presentationer, webbplatser och sociala medier relaterade till organisationen (WOW). Jag förstår också att ingen royalty, avgift eller annan ersättning ska betalas till mig på grund av sådan användning.*
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" required name="mediaConsent" value="yes" onChange={(e) => updateField("mediaConsent", e.target.value)} className="text-primary focus:ring-ring w-4 h-4" />
                    <span className="text-sm font-medium">Ja</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" required name="mediaConsent" value="no" onChange={(e) => updateField("mediaConsent", e.target.value)} className="text-primary focus:ring-ring w-4 h-4" />
                    <span className="text-sm font-medium">Nej</span>
                  </label>
                </div>
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
