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
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Data consent:</span>
                <p className="font-medium">{person.consent_opt_in ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Source:</span>
                <p className="font-medium">{person.consent_source || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Media consent:</span>
                <p className="font-medium">{person.media_consent === true ? "Yes" : person.media_consent === false ? "No" : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Consent date:</span>
                <p className="font-medium">{person.consent_timestamp ? new Date(person.consent_timestamp).toLocaleDateString() : "—"}</p>
              </div>
            </CardContent>
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
