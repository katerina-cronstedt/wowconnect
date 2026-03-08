import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Loader2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface City {
  id: string;
  name: string;
}

interface Props {
  eventId: string;
  eventCityId?: string | null;
  existingInvitePersonIds: string[];
  onInvited: () => void;
}

export default function InviteMembersDialog({ eventId, eventCityId, existingInvitePersonIds, onInvited }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [cityPersonIds, setCityPersonIds] = useState<Set<string> | null>(null);

  // Fetch cities once
  useEffect(() => {
    if (!open) return;
    supabase.from("cities").select("id, name").order("name").then(({ data }) => {
      setCities(data || []);
      // Default to event city if available
      if (eventCityId && !cityFilter) {
        setCityFilter(eventCityId);
      }
    });
  }, [open]);

  // Fetch person IDs for selected city
  useEffect(() => {
    if (!open) return;
    if (cityFilter === "all") {
      setCityPersonIds(null);
      return;
    }
    const fetchCityPersons = async () => {
      const { data } = await supabase
        .from("person_cities")
        .select("person_id")
        .eq("city_id", cityFilter);
      setCityPersonIds(new Set((data || []).map((d) => d.person_id)));
    };
    fetchCityPersons();
  }, [open, cityFilter]);

  // Fetch people with search
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fetchPeople = async () => {
      let q = supabase.from("people").select("id, first_name, last_name, email").order("first_name");
      if (search.trim()) {
        q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data } = await q.limit(1000);
      setPeople(data || []);
      setLoading(false);
    };
    const t = setTimeout(fetchPeople, 300);
    return () => clearTimeout(t);
  }, [open, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const available = people.filter((p) => {
    if (existingInvitePersonIds.includes(p.id)) return false;
    if (cityPersonIds && !cityPersonIds.has(p.id)) return false;
    return true;
  });

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      available.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const deselectAll = () => setSelected(new Set());

  const handleInvite = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    const rows = Array.from(selected).map((personId) => ({
      event_id: eventId,
      person_id: personId,
    }));
    const { error } = await supabase.from("event_invites").insert(rows);
    setSubmitting(false);
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${selected.size} inbjudningar skapade` });
    setSelected(new Set());
    setOpen(false);
    onInvited();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelected(new Set()); setCityFilter(eventCityId || "all"); } }}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1" /> Bjud in medlemmar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Bjud in medlemmar</DialogTitle></DialogHeader>

        {/* City filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Alla städer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla städer</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cityFilter !== "all" && (
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={selectAllVisible}>
              Välj alla ({available.length})
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök namn eller e-post..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ScrollArea className="h-[300px] border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Inga medlemmar att visa</p>
          ) : (
            <div className="divide-y">
              {available.map((p) => (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} valda</span>
            {selected.size > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={deselectAll}>Rensa</Button>
            )}
          </div>
          <Button onClick={handleInvite} disabled={selected.size === 0 || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Skapa inbjudningar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
