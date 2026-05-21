import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, MapPin, ExternalLink } from "lucide-react";

export default function RsvpPage() {
  const { eventId, token } = useParams<{ eventId: string; token: string }>();
  const [event, setEvent] = useState<any>(null);
  const [person, setPerson] = useState<any>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!eventId || !token) { setError("Ogiltig länk"); setLoading(false); return; }

      // Find invite by token
      const { data: invite } = await supabase
        .from("event_invites")
        .select("person_id")
        .eq("event_id", eventId)
        .eq("rsvp_token", token)
        .single();

      if (!invite) { setError("Ogiltig eller utgången RSVP-länk"); setLoading(false); return; }

      const [eRes, pRes, rsvpRes] = await Promise.all([
        supabase.from("events").select("*").eq("id", eventId).single(),
        supabase.from("people").select("first_name, last_name").eq("id", invite.person_id).single(),
        supabase.from("rsvps").select("response").eq("event_id", eventId).eq("person_id", invite.person_id).single(),
      ]);

      setEvent(eRes.data);
      setPerson({ ...pRes.data, id: invite.person_id });
      setCurrentResponse(rsvpRes.data?.response || null);
      setLoading(false);
    };
    load();
  }, [eventId, token]);

  const handleRsvp = async (response: "yes" | "no") => {
    if (!person || !eventId) return;

    const { error: err } = await supabase.from("rsvps").upsert(
      {
        event_id: eventId,
        person_id: person.id,
        response,
        responded_at: new Date().toISOString(),
        source: "rsvp_link" as any,
      },
      { onConflict: "event_id,person_id" }
    );

    if (err) {
      setError("Något gick fel. Försök igen.");
    } else {
      setCurrentResponse(response);
      setSubmitted(true);

      // Update last_rsvp_yes_at if yes
      if (response === "yes") {
        await supabase.from("people").update({ last_rsvp_yes_at: new Date().toISOString() }).eq("id", person.id);
      }
    }
  };

  const googleCalUrl = event
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.start_datetime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${event.end_datetime ? new Date(event.end_datetime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") : ""}&location=${encodeURIComponent(event.location || "")}&details=${encodeURIComponent(event.description || "")}`
    : "";

  const icsContent = event
    ? `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(event.start_datetime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}\n${event.end_datetime ? `DTEND:${new Date(event.end_datetime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}\n` : ""}SUMMARY:${event.title}\nLOCATION:${event.location || ""}\nDESCRIPTION:${event.description || ""}\nEND:VEVENT\nEND:VCALENDAR`
    : "";

  const downloadIcs = () => {
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.title || "event"}.ics`;
    a.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Laddar...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;

  const mapUrl = event?.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">{event?.title}</CardTitle>
          <div className="flex flex-col items-center gap-1 mt-2 text-muted-foreground">
            <p className="font-medium">
              {new Date(event?.start_datetime).toLocaleDateString("sv-SE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {event?.location && (
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5 ml-1">
                    Se karta <ExternalLink className="h-2 w-2" />
                  </a>
                )}
              </div>
            )}
          </div>
          {person && <p className="text-base mt-4 font-medium">Hej {person.first_name}!</p>}
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {submitted ? (
            <div className="text-center space-y-6 py-4">
              <div className="flex flex-col items-center justify-center gap-3 text-green-600">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <span className="font-semibold text-lg">
                  {currentResponse === "yes" ? "Vi ses där!" : "Tack, vi har noterat ditt svar."}
                </span>
              </div>
              {currentResponse === "yes" && (
                <div className="flex flex-col gap-3 bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Lägg till i din kalender:</p>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
                        Google Kalender
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={downloadIcs}>
                      Outlook / iCal (.ics)
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                Du kan ändra ditt svar när som helst genom att använda samma länk.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentResponse && (
                <div className="bg-primary/5 p-3 rounded-md text-center">
                  <p className="text-sm">
                    Ditt nuvarande svar: <strong className="capitalize">{currentResponse === "yes" ? "Kommer" : "Kommer inte"}</strong>
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button size="lg" className="h-14 text-lg font-bold" onClick={() => handleRsvp("yes")}>
                  Ja, jag kommer!
                </Button>
                <Button variant="outline" size="lg" className="h-12" onClick={() => handleRsvp("no")}>
                  Kan tyvärr inte
                </Button>
              </div>
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Genom att svara hjälper du oss att planera mat och plats.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
