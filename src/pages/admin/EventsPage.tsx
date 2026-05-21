import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Search, Filter, Globe, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, role } = useAuth();
  const [form, setForm] = useState({
    title: "",
    city_id: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    event_type: "lunch" as string,
    status: "draft" as string,
    capacity: "",
    description: "",
    is_public: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const fetchEvents = async () => {
    setLoading(true);
    // Fetch cities first
    const { data: citiesData } = await supabase.from("cities").select("id, name").order("name");
    setCities(citiesData || []);

    let query = supabase
      .from("events")
      .select("*, cities(name)")
      .order("start_datetime", { ascending: false });

    // If volunteer, only show events they are assigned to
    if (role === "volunteer" && user) {
      const { data: assignments } = await supabase
        .from("event_volunteers" as any)
        .select("event_id")
        .eq("user_id", user.id);
      
      const assignedIds = (assignments as any[])?.map(a => a.event_id) || [];
      query = query.in("id", assignedIds);
    }

    const { data, error } = await query.limit(100);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta evenemang", variant: "destructive" });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [role, user?.id]);

  const handleCreate = async () => {
    const { error } = await supabase.from("events").insert({
      title: form.title,
      city_id: form.city_id || null,
      location: form.location || null,
      start_datetime: form.start_datetime,
      end_datetime: form.end_datetime || null,
      event_type: form.event_type as any,
      status: form.status as any,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      description: form.description || null,
      is_public: form.is_public,
      created_by_user_id: user?.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created" });
      setDialogOpen(false);
      setForm({ title: "", city_id: "", location: "", start_datetime: "", end_datetime: "", event_type: "lunch", status: "draft", capacity: "", description: "", is_public: false });
      fetchEvents();
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === "all" || e.city_id === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök event..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Alla städer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla städer</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Select value={form.city_id} onValueChange={(v) => setForm({ ...form, city_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="onegoal">OneGoal</SelectItem>
                        <SelectItem value="gala">Gala</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start *</Label>
                    <Input type="datetime-local" value={form.start_datetime} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input type="datetime-local" value={form.end_datetime} onChange={(e) => setForm({ ...form, end_datetime: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Capacity</Label>
                    <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <Select value={form.is_public ? "public" : "private"} onValueChange={(v) => setForm({ ...form, is_public: v === "public" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private (Invite only)</SelectItem>
                        <SelectItem value="public">Public (Open for all)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={!form.title || !form.start_datetime}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link to={`/admin/events/${e.id}`} className="font-medium text-primary hover:underline">
                      {e.title}
                    </Link>
                  </TableCell>
                  <TableCell>{e.cities?.name || "—"}</TableCell>
                  <TableCell>
                    {e.is_public ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 gap-1 border-green-200">
                        <Globe className="h-3 w-3" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" /> Private
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(e.start_datetime).toLocaleDateString("sv-SE")}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{e.event_type}</Badge></TableCell>
                  <TableCell><Badge variant={e.status === "published" ? "default" : "secondary"} className="capitalize">{e.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {events.length === 0 ? "No events yet" : "No results match your filters"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
