import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Props {
  eventId: string;
  existingInvitePersonIds: string[];
  onInvited: () => void;
}

export default function InviteMembersDialog({ eventId, existingInvitePersonIds, onInvited }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fetchPeople = async () => {
      let q = supabase.from("people").select("id, first_name, last_name, email").order("first_name");
      if (search.trim()) {
        q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data } = await q.limit(200);
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

  const available = people.filter((p) => !existingInvitePersonIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1" /> Bjud in medlemmar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Bjud in medlemmar</DialogTitle></DialogHeader>
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
          <span className="text-sm text-muted-foreground">{selected.size} valda</span>
          <Button onClick={handleInvite} disabled={selected.size === 0 || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Skapa inbjudningar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
