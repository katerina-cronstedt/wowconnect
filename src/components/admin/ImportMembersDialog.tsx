import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface Props {
  cities: { id: string; name: string }[];
  onImported: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header - handle quoted fields
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

export default function ImportMembersDialog({ cities, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [cityId, setCityId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ added: number; skipped: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) {
      toast.error("Välj en CSV-fil");
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error("Inga rader hittades i CSV-filen");
        setImporting(false);
        return;
      }

      // Map CSV columns to our fields
      const mapRow = (row: Record<string, string>) => {
        const email = (row["Email"] || row["email"] || "").trim().toLowerCase();
        const firstName = (row["First Name"] || row["first_name"] || "").trim();
        const lastName = (row["Last Name"] || row["last_name"] || "").trim();
        let phone = (row["Mobile Phone Number"] || row["phone"] || "").trim();
        const profession = (row["Yrke"] || row["profession"] || "").trim();
        const countryOfOrigin = (row["Ursprungsland"] || row["country_of_origin"] || "").trim();

        // Normalize phone: add + prefix if starts with 46
        if (phone && /^\d/.test(phone)) {
          phone = "+" + phone;
        }

        return { email, first_name: firstName, last_name: lastName, phone, profession, country_of_origin: countryOfOrigin };
      };

      // Get existing emails to skip duplicates
      const { data: existingPeople } = await supabase
        .from("people")
        .select("id, email");
      const existingEmails = new Map((existingPeople || []).map((p) => [p.email.toLowerCase(), p.id]));

      let added = 0;
      let skipped = 0;
      let errors = 0;
      const batchSize = 20;
      const mapped = rows.map(mapRow).filter((r) => r.email && r.first_name && r.last_name);

      for (let i = 0; i < mapped.length; i += batchSize) {
        const batch = mapped.slice(i, i + batchSize);
        const toInsert = batch.filter((r) => !existingEmails.has(r.email));
        const toSkip = batch.filter((r) => existingEmails.has(r.email));
        skipped += toSkip.length;

        if (toInsert.length > 0) {
          const { data: inserted, error } = await supabase
            .from("people")
            .insert(
              toInsert.map((r) => ({
                first_name: r.first_name,
                last_name: r.last_name,
                email: r.email,
                phone: r.phone || null,
                profession: r.profession || null,
                country_of_origin: r.country_of_origin || null,
                roles: ["member"] as string[],
                engagement_status: "Active",
              }))
            )
            .select("id, email");

          if (error) {
            errors += toInsert.length;
            console.error("Batch insert error:", error);
          } else if (inserted && cityId) {
            // Link to city
            const cityLinks = inserted.map((p) => ({
              person_id: p.id,
              city_id: cityId,
              is_primary: true,
            }));
            await supabase.from("person_cities").insert(cityLinks);
            added += inserted.length;
          } else {
            added += toInsert.length;
          }
        }

        setProgress(Math.round(((i + batch.length) / mapped.length) * 100));
      }

      setResult({ added, skipped, errors });
      if (added > 0) {
        toast.success(`${added} medlemmar importerade!`);
        onImported();
      }
    } catch (err: any) {
      toast.error(err.message || "Importfel");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCityId("");
    setProgress(0);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-1" /> Importera CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importera medlemmar från CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>CSV-fil</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Förväntade kolumner: First Name, Last Name, Email, Mobile Phone Number, Yrke, Ursprungsland
          </p>
          <div className="space-y-1.5">
            <Label>Tilldela stad (valfritt)</Label>
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger>
                <SelectValue placeholder="Ingen stad" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">{progress}%</p>
            </div>
          )}

          {result && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <p>✅ Tillagda: <strong>{result.added}</strong></p>
              <p>⏭️ Överhoppade (finns redan): <strong>{result.skipped}</strong></p>
              {result.errors > 0 && <p>❌ Fel: <strong>{result.errors}</strong></p>}
            </div>
          )}

          {result && result.added > 0 ? (
            <Button onClick={() => setOpen(false)} className="w-full">
              Klar – stäng
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={importing || !file} className="w-full">
              {importing ? "Importerar..." : "Starta import"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
