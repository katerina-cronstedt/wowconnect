import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, UserMinus, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Props {
  eventId: string;
  onUpdate?: () => void;
}

export default function ManageVolunteersDialog({ eventId, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [uRes, aRes] = await Promise.all([
      supabase.from("profiles").select("*").limit(50),
      supabase.from("event_volunteers" as any).select("*").eq("event_id", eventId)
    ]);
    setUsers(uRes.data || []);
    setAssignments(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const handleAssign = async (userId: string) => {
    const { error } = await supabase.from("event_volunteers" as any).insert({
      event_id: eventId,
      user_id: userId
    });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte tilldela volontär", variant: "destructive" });
    } else {
      toast({ title: "Volontär tilldelad" });
      fetchData();
      onUpdate?.();
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    const { error } = await supabase.from("event_volunteers" as any).delete().eq("id", assignmentId);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort volontär", variant: "destructive" });
    } else {
      toast({ title: "Volontär borttagen" });
      fetchData();
      onUpdate?.();
    }
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" /> Hantera volontärer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hantera volontärer för event</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök användare..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">Inga användare hittades</p>
            ) : (
              filteredUsers.map((u) => {
                const assignment = assignments.find(a => a.user_id === u.id);
                return (
                  <div key={u.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="text-sm font-medium">{u.display_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    {assignment ? (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleUnassign(assignment.id)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleAssign(u.id)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
