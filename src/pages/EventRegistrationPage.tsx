import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EventRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gdpr_consent: false,
    media_consent: false,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(name)")
        .eq("id", id)
        .single();
      
      if (error || !data || !data.is_public) {
        setLoading(false);
        return;
      }
      
      setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdpr_consent) {
      toast({ title: "Samtycke krävs", description: "Du måste godkänna att vi behandlar dina personuppgifter.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create or find person
      // In a real scenario, we'd check if email exists. For now, we'll insert or let Supabase handle uniqueness if configured (it's not by default for 'people').
      // Let's check if person exists first
      const { data: existingPerson } = await supabase
        .from("people")
        .select("id")
        .eq("email", form.email.toLowerCase())
        .maybeSingle();

      let personId = existingPerson?.id;

      if (!personId) {
        const { data: newPerson, error: pError } = await supabase
          .from("people")
          .insert({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email.toLowerCase(),
            phone: form.phone,
            consent_opt_in: true,
            consent_date: new Date().toISOString(),
            media_consent: form.media_consent,
            media_consent_date: form.media_consent ? new Date().toISOString() : null,
          })
          .select("id")
          .single();
        
        if (pError) throw pError;
        personId = newPerson.id;
        
        // Also link to city if event has one
        if (event.city_id) {
          await supabase.from("person_cities").insert({
            person_id: personId,
            city_id: event.city_id,
          });
        }
      }

      // 2. Create RSVP
      const { error: rError } = await supabase.from("rsvps").upsert({
        event_id: id!,
        person_id: personId,
        response: "yes",
        responded_at: new Date().toISOString(),
        source: "public_registration" as any,
      }, { onConflict: "event_id,person_id" });

      if (rError) throw rError;

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Ett fel uppstod", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Laddar...</div>;
  
  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-2">Eventet hittades inte</h1>
      <p className="text-muted-foreground mb-4">Detta event är antingen privat eller existerar inte.</p>
      <Button asChild><Link to="/">Tillbaka till start</Link></Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Event Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{event.event_type.toUpperCase()}</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">{event.title}</h1>
            <div className="space-y-3 text-lg text-muted-foreground">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{new Date(event.start_datetime).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{event.location || event.cities?.name}</span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-sm text-muted-foreground">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </div>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <p className="text-sm font-medium">Om Women on Wednesday (WOW)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Genom att anmäla dig till detta event blir du en del av vårt nätverk för utrikesfödda kvinnor i Sverige.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle>Anmälan</CardTitle>
            <CardDescription>Fyll i dina uppgifter för att säkra din plats.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8 space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Du är anmäld!</h2>
                <p className="text-muted-foreground">
                  Vi har tagit emot din anmälan till <strong>{event.title}</strong>. 
                  En bekräftelse kommer att skickas till {form.email}.
                </p>
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <Link to="/">Gå till startsidan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Förnamn *</Label>
                    <Input 
                      id="first_name" 
                      required 
                      value={form.first_name} 
                      onChange={e => setForm({...form, first_name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Efternamn *</Label>
                    <Input 
                      id="last_name" 
                      required 
                      value={form.last_name} 
                      onChange={e => setForm({...form, last_name: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-post *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="070-000 00 00"
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="gdpr" 
                      checked={form.gdpr_consent} 
                      onCheckedChange={(v) => setForm({...form, gdpr_consent: !!v})} 
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="gdpr" className="text-xs font-normal leading-tight">
                        Jag tillåter WOW att spara personliga uppgifter om mig så som namn, adress, telefonnummer, ålder, nationalitet, etc. för att kunna hantera mitt medlemskap och informera om kommande aktiviteter. *
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="media" 
                      checked={form.media_consent} 
                      onCheckedChange={(v) => setForm({...form, media_consent: !!v})} 
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="media" className="text-xs font-normal leading-tight text-muted-foreground">
                        Jag ger WOW min tillåtelse att använda bilder/filmer på mig i syfte att marknadsföra WOW:s verksamhet på sociala medier och hemsida.
                      </Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg mt-6" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Anmäler...
                    </>
                  ) : (
                    "Anmäl mig nu"
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  * Obligatoriska fält
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
