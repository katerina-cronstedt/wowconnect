import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [pRes, rsvpRes, attRes] = await Promise.all([
        supabase
          .from("people")
          .select("*, person_cities(city_id, is_primary, cities(name)), person_languages(language_id, languages(name))")
          .eq("id", id)
          .single(),
        supabase
          .from("rsvps")
          .select("*, events(title, start_datetime)")
          .eq("person_id", id)
          .order("responded_at", { ascending: false })
          .limit(20),
        supabase
          .from("attendance")
          .select("*, events(title, start_datetime)")
          .eq("person_id", id)
          .order("checked_in_at", { ascending: false })
          .limit(20),
      ]);
      setPerson(pRes.data);
      setRsvps(rsvpRes.data || []);
      setAttendance(attRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    if (!person) return;
    setSaving(true);
    const { error } = await supabase
      .from("people")
      .update({
        first_name: person.first_name,
        last_name: person.last_name,
        phone: person.phone,
        profession: person.profession,
        country_of_origin: person.country_of_origin,
        birthday: person.birthday,
        consent_opt_in: person.consent_opt_in,
        media_consent: person.media_consent,
        notes: person.notes,
        roles: person.roles,
        tags: person.tags,
      })
      .eq("id", person.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Member updated successfully" });
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!person) return <div className="text-center py-12 text-muted-foreground">Member not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/members")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{person.first_name} {person.last_name}</h1>
          <p className="text-muted-foreground">{person.email}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Personal Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input value={person.first_name} onChange={(e) => setPerson({ ...person, first_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={person.last_name} onChange={(e) => setPerson({ ...person, last_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={person.phone || ""} onChange={(e) => setPerson({ ...person, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Profession</Label>
                  <Input value={person.profession || ""} onChange={(e) => setPerson({ ...person, profession: e.target.value })} />
                </div>
                <div>
                  <Label>Ursprungsland (Country of Origin)</Label>
                  <Input value={person.country_of_origin || ""} onChange={(e) => setPerson({ ...person, country_of_origin: e.target.value })} />
                </div>
                <div>
                  <Label>Födelsedag (Birthday)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !person.birthday && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {person.birthday ? format(new Date(person.birthday), "yyyy-MM-dd") : <span>Välj datum</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={person.birthday ? new Date(person.birthday) : undefined}
                        onSelect={(date) => setPerson({ ...person, birthday: date ? format(date, "yyyy-MM-dd") : null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Membership</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Cities</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {person.person_cities?.map((pc: any) => (
                      <Badge key={pc.city_id} variant="secondary">
                        {pc.cities?.name} {pc.is_primary && "(Primary)"}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {person.person_languages?.map((pl: any) => (
                      <Badge key={pl.language_id} variant="outline">{pl.languages?.name}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Swedish Level</Label>
                  <p className="text-sm mt-1">
                    {person.swedish_level_simple_self_reported || "—"}
                    {person.swedish_level_cefr_result && ` (CEFR: ${person.swedish_level_cefr_result})`}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={person.engagement_status === "Active" ? "default" : "secondary"} className="ml-2">
                    {person.engagement_status || "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">GDPR & Consent</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base">Data Consent</Label>
                    <p className="text-xs text-muted-foreground">Medlemmen tillåter WOW att spara personliga uppgifter.</p>
                  </div>
                  <Switch
                    checked={person.consent_opt_in === true}
                    onCheckedChange={(checked) => setPerson({ ...person, consent_opt_in: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base">Media Consent</Label>
                    <p className="text-xs text-muted-foreground">Tillåtelse att använda namn, bild eller röst i kommunikation.</p>
                  </div>
                  <Switch
                    checked={person.media_consent === true}
                    onCheckedChange={(checked) => setPerson({ ...person, media_consent: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Source:</span>
                    <p className="font-medium text-sm">{person.consent_source || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Consent date:</span>
                    <p className="font-medium text-sm">
                      {person.consent_timestamp ? new Date(person.consent_timestamp).toLocaleDateString() : person.created_at ? new Date(person.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-md text-[11px] leading-relaxed text-muted-foreground italic border-l-2 border-accent">
                  "Jag tillåter WOW att spara personliga uppgifter om mig så som namn, adress, telefonnummer, ålder, nationalitet, etc."
                </div>
              </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={person.notes || ""}
                onChange={(e) => setPerson({ ...person, notes: e.target.value })}
                placeholder="Internal notes about this member..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">RSVPs</CardTitle></CardHeader>
            <CardContent>
              {rsvps.length === 0 ? (
                <p className="text-muted-foreground text-sm">No RSVPs yet</p>
              ) : (
                <div className="space-y-2">
                  {rsvps.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <span>{r.events?.title || "Unknown event"}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.response === "yes" ? "default" : "secondary"}>{r.response}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.responded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Attendance</CardTitle></CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-sm">No attendance records yet</p>
              ) : (
                <div className="space-y-2">
                  {attendance.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <span>{a.events?.title || "Unknown event"}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{a.attendance_status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {a.checked_in_at ? new Date(a.checked_in_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
