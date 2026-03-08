import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import InviteMembersDialog from "@/components/admin/event/InviteMembersDialog";
import WalkInDialog from "@/components/admin/event/WalkInDialog";
import AttendanceBadge, { RsvpBadge } from "@/components/admin/event/AttendanceBadge";

type FilterType = "all" | "invited" | "rsvp_yes" | "rsvp_no" | "arrived" | "excused" | "no_show" | "walk_in";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchData = async () => {
    if (!id) return;
    const [eRes, iRes, rRes, aRes] = await Promise.all([
      supabase.from("events").select("*, cities(name)").eq("id", id).single(),
      supabase.from("event_invites").select("*, people(id, first_name, last_name, email, pending_signup)").eq("event_id", id),
      supabase.from("rsvps").select("*").eq("event_id", id),
      supabase.from("attendance").select("*, people(id, first_name, last_name, email, pending_signup)").eq("event_id", id),
    ]);
    setEvent(eRes.data);
    setInvites(iRes.data || []);
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

  const copyRsvpLink = (token: string) => {
    const url = `${window.location.origin}/rsvp/${id}/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "RSVP-länk kopierad" });
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Laddar...</div>;
  if (!event) return <div className="text-center py-12 text-muted-foreground">Event hittades inte</div>;

  // Build unified list
  const rsvpByPerson = Object.fromEntries(rsvps.map((r) => [r.person_id, r]));
  const attByPerson = Object.fromEntries(attendances.map((a) => [a.person_id, a]));
  const inviteByPerson = Object.fromEntries(invites.map((i) => [i.person_id, i]));

  const invitedRows = invites.map((inv) => ({
    personId: inv.person_id,
    name: `${inv.people?.first_name || ""} ${inv.people?.last_name || ""}`.trim(),
    email: inv.people?.email,
    rsvp: rsvpByPerson[inv.person_id]?.response,
    attendance: attByPerson[inv.person_id]?.attendance_status,
    source: attByPerson[inv.person_id]?.source || "rsvp",
    rsvpToken: inv.rsvp_token,
    pendingSignup: inv.people?.pending_signup,
  }));

  const walkInRows = attendances
    .filter((a) => a.source === "walk_in" && !inviteByPerson[a.person_id])
    .map((a) => ({
      personId: a.person_id,
      name: `${a.people?.first_name || ""} ${a.people?.last_name || ""}`.trim(),
      email: a.people?.email,
      rsvp: undefined,
      attendance: a.attendance_status,
      source: "walk_in" as const,
      rsvpToken: undefined,
      pendingSignup: a.people?.pending_signup,
    }));

  const allRows = [...invitedRows, ...walkInRows];

  // Filter rows based on active filter
  const filteredRows = allRows.filter((row) => {
    switch (filter) {
      case "invited": return inviteByPerson[row.personId];
      case "rsvp_yes": return row.rsvp === "yes";
      case "rsvp_no": return row.rsvp === "no";
      case "arrived": return row.attendance === "arrived" || row.attendance === "late";
      case "excused": return row.attendance === "excused";
      case "no_show": return row.attendance === "no_show";
      case "walk_in": return row.source === "walk_in";
      default: return true;
    }
  });

  // Stats
  const yesCount = rsvps.filter((r) => r.response === "yes").length;
  const noCount = rsvps.filter((r) => r.response === "no").length;
  const arrivedCount = attendances.filter((a) => a.attendance_status === "arrived" || a.attendance_status === "late").length;
  const excusedCount = attendances.filter((a) => a.attendance_status === "excused").length;
  const noShowCount = attendances.filter((a) => a.attendance_status === "no_show").length;
  const walkInCount = attendances.filter((a) => a.source === "walk_in").length;

  const stats: { label: string; value: number; filterKey: FilterType }[] = [
    { label: "Inbjudna", value: invites.length, filterKey: "invited" },
    { label: "RSVP Ja", value: yesCount, filterKey: "rsvp_yes" },
    { label: "RSVP Nej", value: noCount, filterKey: "rsvp_no" },
    { label: "Närvarande", value: arrivedCount, filterKey: "arrived" },
    { label: "Förhinder", value: excusedCount, filterKey: "excused" },
    { label: "No-show", value: noShowCount, filterKey: "no_show" },
    { label: "Walk-ins", value: walkInCount, filterKey: "walk_in" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
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

      {/* Stats - clickable */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${filter === s.filterKey ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilter(filter === s.filterKey ? "all" : s.filterKey)}
          >
            <CardContent className="pt-3 pb-2 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active filter indicator */}
      {filter !== "all" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Filtrerar: {stats.find((s) => s.filterKey === filter)?.label}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setFilter("all")}>
            Visa alla
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Deltagarlista</h2>
        <div className="flex gap-2">
          <InviteMembersDialog
            eventId={id!}
            eventCityId={event.city_id}
            existingInvitePersonIds={invites.map((i) => i.person_id)}
            onInvited={fetchData}
          />
          <WalkInDialog eventId={id!} onDone={fetchData} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Närvaro</TableHead>
              <TableHead>Källa</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                {filter !== "all" ? "Inga deltagare matchar filtret." : "Inga deltagare ännu. Bjud in medlemmar för att komma igång."}
              </TableCell></TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.personId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/admin/members/${row.personId}`} className="hover:underline text-primary">
                        {row.name || "—"}
                      </Link>
                      {row.pendingSignup && (
                        <span title="Har inte slutfört registrering"><AlertCircle className="h-3.5 w-3.5 text-orange-500" /></span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.email}</TableCell>
                  <TableCell><RsvpBadge response={row.rsvp} /></TableCell>
                  <TableCell>
                    {row.source === "walk_in" && !row.rsvpToken ? (
                      <AttendanceBadge status={row.attendance} source="walk_in" />
                    ) : (
                      <Select
                        value={row.attendance || ""}
                        onValueChange={(v) => updateAttendance(row.personId, v)}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Markera..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arrived">Närvarande</SelectItem>
                          <SelectItem value="late">Kom sent</SelectItem>
                          <SelectItem value="excused">Meddelat förhinder</SelectItem>
                          <SelectItem value="no_show">No-show</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{row.source === "walk_in" ? "Walk-in" : "Inbjudan"}</TableCell>
                  <TableCell>
                    {row.rsvpToken && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyRsvpLink(row.rsvpToken!)} title="Kopiera RSVP-länk">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
