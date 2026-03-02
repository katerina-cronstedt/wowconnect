import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

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
      if (!eventId || !token) { setError("Invalid link"); setLoading(false); return; }

      // Find invite by token
      const { data: invite } = await supabase
        .from("event_invites")
        .select("person_id")
        .eq("event_id", eventId)
        .eq("rsvp_token", token)
        .single();

      if (!invite) { setError("Invalid or expired RSVP link"); setLoading(false); return; }

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
      setError("Something went wrong. Please try again.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{event?.title}</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(event?.start_datetime).toLocaleDateString("sv-SE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {event?.location && ` · ${event.location}`}
          </p>
          {person && <p className="text-sm mt-2">Hi {person.first_name}!</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  {currentResponse === "yes" ? "You're coming! See you there." : "Got it, we'll miss you!"}
                </span>
              </div>
              {currentResponse === "yes" && (
                <div className="flex flex-col gap-2">
                  <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    Add to Google Calendar →
                  </a>
                  <button onClick={downloadIcs} className="text-primary hover:underline text-sm">
                    Download .ics file →
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">You can change your response by revisiting this link.</p>
            </div>
          ) : (
            <>
              {currentResponse && (
                <p className="text-sm text-muted-foreground text-center">
                  Your current response: <strong className="capitalize">{currentResponse}</strong>
                </p>
              )}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleRsvp("yes")}>
                  Yes, I'm coming!
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleRsvp("no")}>
                  Can't make it
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
