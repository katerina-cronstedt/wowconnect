import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search, Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  eventId: string;
  onDone: () => void;
}

export default function WalkInDialog({ eventId, onDone }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("existing");

  // Existing member search
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // New person form
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tab !== "existing" || !search.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("people")
        .select("id, first_name, last_name, email")
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(20);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, tab]);

  const markArrived = async (personId: string) => {
    setSubmitting(true);
    await supabase.from("attendance").upsert({
      event_id: eventId,
      person_id: personId,
      attendance_status: "arrived" as any,
      checked_in_by_user_id: user?.id,
      source: "walk_in" as any,
    }, { onConflict: "event_id,person_id" });
    setSubmitting(false);
    toast({ title: "Walk-in registrerad" });
    setOpen(false);
    setSearch("");
    setResults([]);
    onDone();
  };

  const handleNewPerson = async () => {
    setSubmitting(true);
    // Check if email already exists
    const { data: existing } = await supabase.from("people").select("id").eq("email", form.email).single();
    let personId: string;
    if (existing) {
      personId = existing.id;
    } else {
      const { data: newP, error } = await supabase.from("people").insert({
        first_name: form.first_name || "Walk-in",
        last_name: form.last_name || "",
        email: form.email,
        phone: form.phone || null,
        pending_signup: true,
        consent_opt_in: true,
        consent_source: "event_walkin" as any,
        consent_timestamp: new Date().toISOString(),
      }).select("id").single();
      if (error || !newP) {
        toast({ title: "Fel", description: error?.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      personId = newP.id;
    }
    await markArrived(personId);
    setForm({ first_name: "", last_name: "", email: "", phone: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Walk-in</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrera walk-in</DialogTitle></DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="existing" className="flex-1">Befintlig medlem</TabsTrigger>
            <TabsTrigger value="new" className="flex-1">Ny person</TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Sök namn eller e-post..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <ScrollArea className="h-[200px] border rounded-md">
              {searching ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{search ? "Inga träffar" : "Börja skriva för att söka"}</p>
              ) : (
                <div className="divide-y">
                  {results.map((p) => (
                    <button key={p.id} className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 text-left" onClick={() => markArrived(p.id)} disabled={submitting}>
                      <div>
                        <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="new" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Förnamn</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Efternamn</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div><Label>E-post *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <Button className="w-full" onClick={handleNewPerson} disabled={!form.email || submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Registrera & Checka in
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
