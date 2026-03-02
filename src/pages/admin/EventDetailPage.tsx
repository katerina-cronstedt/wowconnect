import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, UserPlus, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });

  const fetchData = async () => {
    if (!id) return;
    const [eRes, rRes, aRes] = await Promise.all([
      supabase.from("events").select("*, cities(name)").eq("id", id).single(),
      supabase.from("rsvps").select("*, people(first_name, last_name, email)").eq("event_id", id),
      supabase.from("attendance").select("*, people(first_name, last_name, email)").eq("event_id", id),
    ]);
    setEvent(eRes.data);
    setRsvps(rRes.data || []);
    setAttendances(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateAttendance = async (personId: string, status: string) => {
    const existing = attendances.find((a) => a.person_id === personId);
    if (existing) {
      await supabase.from("attendance").update({ attendance_status: status as any }).eq("id", existing.id);
    } else {
      await supabase.from("attendance").insert({
        event_id: id!,
        person_id: personId,
        attendance_status: status as any,
        checked_in_by_user_id: user?.id,
        source: "rsvp" as any,
      });
    }
    fetchData();
  };

  const handleWalkIn = async () => {
    // Find or create person
    let personId: string;
    const { data: existing } = await supabase.from("people").select("id").eq("email", walkInForm.email).single();
    if (existing) {
      personId = existing.id;
    } else {
      const { data: newPerson, error } = await supabase.from("people").insert({
        first_name: walkInForm.first_name,
        last_name: walkInForm.last_name,
        email: walkInForm.email,
        phone: walkInForm.phone || null,
        consent_opt_in: true,
        consent_source: "event_walkin" as any,
        consent_timestamp: new Date().toISOString(),
      }).select("id").single();
      if (error || !newPerson) {
        toast({ title: "Error", description: error?.message || "Failed to create person", variant: "destructive" });
        return;
      }
      personId = newPerson.id;
    }

    // Mark attendance
    await supabase.from("attendance").upsert({
      event_id: id!,
      person_id: personId,
      attendance_status: "arrived" as any,
      checked_in_by_user_id: user?.id,
      source: "walk_in" as any,
    }, { onConflict: "event_id,person_id" });

    toast({ title: "Walk-in registered" });
    setWalkInOpen(false);
    setWalkInForm({ first_name: "", last_name: "", email: "", phone: "" });
    fetchData();
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-muted-foreground">Event not found</div>;

  const yesCount = rsvps.filter((r) => r.response === "yes").length;
  const noCount = rsvps.filter((r) => r.response === "no").length;
  const arrivedCount = attendances.filter((a) => a.attendance_status === "arrived" || a.attendance_status === "late").length;
  const noShowCount = attendances.filter((a) => a.attendance_status === "no_show").length;
  const walkInCount = attendances.filter((a) => a.source === "walk_in").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/events")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">
            {event.cities?.name} · {new Date(event.start_datetime).toLocaleDateString("sv-SE")} · <Badge variant="outline" className="capitalize">{event.event_type}</Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Invited", value: rsvps.length },
          { label: "RSVP Yes", value: yesCount },
          { label: "RSVP No", value: noCount },
          { label: "Attended", value: arrivedCount },
          { label: "No-shows", value: noShowCount },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Check-in</h2>
        <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Walk-in</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register Walk-in</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First Name *</Label><Input value={walkInForm.first_name} onChange={(e) => setWalkInForm({ ...walkInForm, first_name: e.target.value })} /></div>
                <div><Label>Last Name *</Label><Input value={walkInForm.last_name} onChange={(e) => setWalkInForm({ ...walkInForm, last_name: e.target.value })} /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={walkInForm.email} onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} /></div>
              <Button className="w-full" onClick={handleWalkIn} disabled={!walkInForm.first_name || !walkInForm.last_name || !walkInForm.email}>
                Register & Check In
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rsvps.filter((r) => r.response === "yes").map((r) => {
              const att = attendances.find((a) => a.person_id === r.person_id);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.people?.first_name} {r.people?.last_name}</TableCell>
                  <TableCell><Badge>Yes</Badge></TableCell>
                  <TableCell>
                    <Select
                      value={att?.attendance_status || ""}
                      onValueChange={(v) => updateAttendance(r.person_id, v)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Mark..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arrived">Arrived</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="no_show">No-show</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{att?.source || "—"}</TableCell>
                </TableRow>
              );
            })}
            {attendances.filter((a) => a.source === "walk_in").map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.people?.first_name} {a.people?.last_name}</TableCell>
                <TableCell><Badge variant="secondary">Walk-in</Badge></TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{a.attendance_status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">walk_in</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
