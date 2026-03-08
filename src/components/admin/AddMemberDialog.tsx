import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Props {
  cities: { id: string; name: string }[];
  onAdded: () => void;
}

export default function AddMemberDialog({ cities, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profession: "",
    country_of_origin: "",
    city_id: "",
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.email || !form.first_name || !form.last_name) {
      toast.error("Förnamn, efternamn och e-post krävs");
      return;
    }

    setSaving(true);
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from("people")
        .select("id")
        .eq("email", form.email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        toast.error("En medlem med denna e-post finns redan");
        setSaving(false);
        return;
      }

      const { data: person, error } = await supabase
        .from("people")
        .insert({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          profession: form.profession.trim() || null,
          country_of_origin: form.country_of_origin.trim() || null,
          roles: ["member"],
          engagement_status: "Active",
        })
        .select("id")
        .single();

      if (error) throw error;

      if (form.city_id && person) {
        await supabase.from("person_cities").insert({
          person_id: person.id,
          city_id: form.city_id,
          is_primary: true,
        });
      }

      toast.success("Medlem tillagd!");
      setForm({ first_name: "", last_name: "", email: "", phone: "", profession: "", country_of_origin: "", city_id: "" });
      setOpen(false);
      onAdded();
    } catch (err: any) {
      toast.error(err.message || "Kunde inte lägga till medlem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Lägg till
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till medlem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Förnamn *</Label>
              <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Efternamn *</Label>
              <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>E-post *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefon</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Yrke</Label>
            <Input value={form.profession} onChange={(e) => set("profession", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Ursprungsland</Label>
            <Input value={form.country_of_origin} onChange={(e) => set("country_of_origin", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Stad</Label>
            <Select value={form.city_id} onValueChange={(v) => set("city_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Välj stad..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Sparar..." : "Lägg till medlem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
