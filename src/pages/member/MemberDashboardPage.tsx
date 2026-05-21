import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formOptions } from "@/config/formOptions";
import { User, Calendar, Award, Sparkles, MapPin, Phone, Linkedin, Heart, HelpCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MemberDashboardPage() {
  const { personId, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [myRsvps, setMyRsvps] = useState<any[]>([]);

  useEffect(() => {
    if (!personId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch member profile
        const { data: profileData, error: pError } = await supabase
          .from("people")
          .select("*")
          .eq("id", personId)
          .single();

        if (pError) throw pError;
        setProfile(profileData);

        // 2. Fetch public events
        const { data: eventsData, error: eError } = await supabase
          .from("events")
          .select("*, cities(name)")
          .eq("is_public", true)
          .eq("status", "published")
          .order("start_datetime", { ascending: true });

        if (eError) throw eError;
        setEvents(eventsData || []);

        // 3. Fetch my rsvps
        const { data: rsvpsData, error: rError } = await supabase
          .from("rsvps")
          .select("*, events(*, cities(name))")
          .eq("person_id", personId);

        if (rError) throw rError;
        setMyRsvps(rsvpsData || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        toast({
          title: "Fel vid hämtning av data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [personId]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("people")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          profession: profile.profession,
          linkedin_url: profile.linkedin_url,
          allergies: profile.allergies,
          swedish_level_simple_self_reported: profile.swedish_level_simple_self_reported,
          country_of_origin: profile.country_of_origin,
          citizenship: profile.citizenship,
        })
        .eq("id", personId);

      if (error) throw error;
      toast({
        title: "Profilen uppdaterad",
        description: "Dina ändringar har sparats framgångsrikt.",
      });
    } catch (err: any) {
      toast({
        title: "Kunde inte spara profil",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRsvp = async (eventId: string, response: "yes" | "no") => {
    if (!personId) return;

    try {
      const { error } = await supabase
        .from("rsvps")
        .upsert({
          event_id: eventId,
          person_id: personId,
          response,
          responded_at: new Date().toISOString(),
          source: "rsvp_link",
        }, { onConflict: "event_id,person_id" });

      if (error) throw error;

      toast({
        title: response === "yes" ? "Anmäld!" : "RSVP skickat",
        description: response === "yes" 
          ? "Du är nu anmäld till eventet." 
          : "Du har angett att du inte kommer.",
      });

      // Refresh RSVPs
      const { data: rsvpsData } = await supabase
        .from("rsvps")
        .select("*, events(*, cities(name))")
        .eq("person_id", personId);
      setMyRsvps(rsvpsData || []);
    } catch (err: any) {
      toast({
        title: "Kunde inte registrera RSVP",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse font-medium">Laddar din profil...</p>
      </div>
    );
  }

  const myRsvpMap = myRsvps.reduce((acc, curr) => {
    acc[curr.event_id] = curr.response;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/20 via-accent/5 to-background border border-accent/15 p-6 md:p-8"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-accent font-semibold font-sans">
                Välkommen tillbaka
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground">
              Hej, {profile?.first_name || "Medlem"}!
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
              Det här är dina personliga sidor. Här kan du hålla dina medlemsuppgifter uppdaterade och se kommande nätverksträffar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background/80 border-accent/25 text-accent px-3 py-1.5 font-medium text-xs rounded-full">
              Medlem i WOW
            </Badge>
            {profile?.engagement_status === "Active" && (
              <Badge className="bg-green-100 hover:bg-green-200 text-green-800 border-none px-3 py-1.5 font-medium text-xs rounded-full">
                Aktiv status
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-lg border-border">
            <CardHeader className="border-b border-border/50 pb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Mina Profiluppgifter</CardTitle>
                  <CardDescription>Håll dina uppgifter uppdaterade så vi kan matcha dig med rätt event.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Förnamn</Label>
                    <Input
                      id="first_name"
                      required
                      value={profile?.first_name || ""}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Efternamn</Label>
                    <Input
                      id="last_name"
                      required
                      value={profile?.last_name || ""}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post (kan ej ändras)</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="bg-muted text-muted-foreground border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobilnummer</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={profile?.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pl-9"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">WOW-stad</Label>
                    <div className="relative">
                      <select
                        id="city"
                        value={profile?.city || ""}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-shadow"
                      >
                        <option value="">Välj stad</option>
                        {formOptions.cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swedish_level">Svenskanivå</Label>
                    <select
                      id="swedish_level"
                      value={profile?.swedish_level_simple_self_reported || ""}
                      onChange={(e) => setProfile({ ...profile, swedish_level_simple_self_reported: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-shadow"
                    >
                      <option value="">Välj nivå</option>
                      <option value="Native">Native / Flytande</option>
                      <option value="Fluent">Avancerad</option>
                      <option value="Intermediate">Medel</option>
                      <option value="Beginner">Nybörjare</option>
                      <option value="None">Ingen svenska än</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country_of_origin">Ursprungsland</Label>
                    <select
                      id="country_of_origin"
                      value={profile?.country_of_origin || ""}
                      onChange={(e) => setProfile({ ...profile, country_of_origin: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-shadow"
                    >
                      <option value="">Välj land</option>
                      {formOptions.countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citizenship">Medborgarskap</Label>
                    <select
                      id="citizenship"
                      value={profile?.citizenship || ""}
                      onChange={(e) => setProfile({ ...profile, citizenship: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-shadow"
                    >
                      <option value="">Välj land</option>
                      {formOptions.countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profession">Yrke</Label>
                    <Input
                      id="profession"
                      value={profile?.profession || ""}
                      onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                      placeholder="T.ex. Projektledare, Utvecklare"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn-profil</Label>
                    <div className="relative">
                      <Input
                        id="linkedin"
                        value={profile?.linkedin_url || ""}
                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/ditt-namn"
                        className="pl-9"
                      />
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Matallergier / kostpreferenser</Label>
                  <div className="relative">
                    <Input
                      id="allergies"
                      value={profile?.allergies || ""}
                      onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                      placeholder="T.ex. glutenfritt, vegetariskt, inga nötter"
                      className="pl-9"
                    />
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-medium cursor-pointer" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sparar ändringar...
                    </>
                  ) : (
                    "Spara ändringar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Event Registration Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Kommande Evenemang</CardTitle>
                  <CardDescription>Anmäl dig till våra luncher och nätverksträffar.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Det finns inga schemalagda event just nu.</p>
              ) : (
                events.map((event) => {
                  const userRsvp = myRsvpMap[event.id];
                  return (
                    <motion.div 
                      key={event.id}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl border border-border bg-card/50 flex flex-col gap-3 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-1 text-[10px] uppercase font-sans border-accent/20 text-accent">
                            {event.event_type}
                          </Badge>
                          <h4 className="font-serif font-bold text-base leading-snug">{event.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          <MapPin className="w-3 h-3 text-accent" />
                          <span>{event.location || event.cities?.name}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {event.description || "Ingen beskrivning tillgänglig."}
                      </p>
                      
                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/40 mt-1">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {new Date(event.start_datetime).toLocaleDateString("sv-SE", { 
                            day: "numeric", 
                            month: "short", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={userRsvp === "yes" ? "default" : "outline"}
                            onClick={() => handleRsvp(event.id, "yes")}
                            className="h-8 text-xs font-medium cursor-pointer"
                          >
                            {userRsvp === "yes" ? "Anmäld ✓" : "Kommer"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant={userRsvp === "no" ? "destructive" : "ghost"}
                            onClick={() => handleRsvp(event.id, "no")}
                            className="h-8 text-xs font-medium cursor-pointer"
                          >
                            Kan inte
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick info / support card */}
          <Card className="border-accent/15 bg-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-accent">
                <Award className="w-5 h-5" />
                <CardTitle className="font-serif text-lg">OneGoal 1:1 Coaching</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Är du redo att ta nästa steg i karriären? Genom vårt mentorprogram <strong>OneGoal</strong> matchas du med en etablerad yrkesverksam coach för att nå dina mål.
              </p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="w-full text-xs font-medium bg-background" asChild>
                  <a href="/onegoal" target="_blank" rel="noreferrer">Läs mer om OneGoal</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
