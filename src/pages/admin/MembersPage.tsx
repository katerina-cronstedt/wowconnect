import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import AddMemberDialog from "@/components/admin/AddMemberDialog";
import ImportMembersDialog from "@/components/admin/ImportMembersDialog";

interface Person {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  engagement_status: string | null;
  roles: string[];
  created_at: string;
  person_cities: { city_id: string; is_primary: boolean; cities: { name: string } | null }[];
}

export default function MembersPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      supabase
        .from("people")
        .select("id, email, first_name, last_name, phone, engagement_status, roles, created_at, person_cities(city_id, is_primary, cities(name))")
        .order("created_at", { ascending: false }),
      supabase.from("cities").select("id, name").order("name"),
    ]);
    setPeople((pRes.data as unknown as Person[]) || []);
    setCities(cRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      const matchSearch =
        !search ||
        `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase());
      const matchCity =
        cityFilter === "all" ||
        p.person_cities?.some((pc) => pc.city_id === cityFilter);
      const matchRole =
        roleFilter === "all" || p.roles?.includes(roleFilter);
      return matchSearch && matchCity && matchRole;
    });
  }, [people, search, cityFilter, roleFilter]);

  const exportCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "City", "Roles", "Status"];
    const rows = filtered.map((p) => [
      p.first_name,
      p.last_name,
      p.email,
      p.phone || "",
      p.person_cities?.map((pc) => pc.cities?.name).join("; ") || "",
      p.roles?.join(", ") || "",
      p.engagement_status || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="flex gap-2">
          <ImportMembersDialog cities={cities} onImported={fetchData} />
          <AddMemberDialog cities={cities} onAdded={fetchData} />
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>

      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="mentee">Mentee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} members</div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link to={`/admin/members/${p.id}`} className="font-medium text-primary hover:underline">
                      {p.first_name} {p.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    {p.person_cities?.map((pc) => (
                      <Badge key={pc.city_id} variant="secondary" className="mr-1 text-xs">
                        {pc.cities?.name}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {p.roles?.map((r) => (
                      <Badge key={r} variant="outline" className="mr-1 text-xs capitalize">{r}</Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.engagement_status === "Active" ? "default" : "secondary"}>
                      {p.engagement_status || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No members found
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
