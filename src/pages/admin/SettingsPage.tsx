import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, MapPin } from "lucide-react";

type AppRole = "hq_admin" | "hq_team" | "city_team";

const roleLabels: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  hq_admin: { label: "HQ Admin", description: "Full åtkomst, kan skapa alla användare", icon: <ShieldCheck className="h-4 w-4 text-red-500" /> },
  hq_team: { label: "HQ Team", description: "Alla städer, kan inte ta bort eller skapa admins", icon: <Shield className="h-4 w-4 text-orange-500" /> },
  city_team: { label: "City Team", description: "Åtkomst till tilldelad stad", icon: <MapPin className="h-4 w-4 text-blue-500" /> },
  staff: { label: "Staff (legacy)", description: "Äldre roll", icon: <MapPin className="h-4 w-4 text-muted-foreground" /> },
};

interface UserWithRole {
  user_id: string;
  role: string;
  email?: string;
  display_name?: string;
}

export default function SettingsPage() {
  const { user, role, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("city_team");
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const isHqAdmin = role === "hq_admin";
  const isHqTeam = role === "hq_team";
  const canCreateUsers = isHqAdmin || isHqTeam;

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (!roles) { setLoadingUsers(false); return; }

    // Get profiles for display names/emails
    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .in("user_id", userIds);

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

    setUsers(
      roles.map((r) => ({
        user_id: r.user_id,
        role: r.role,
        email: profileMap[r.user_id]?.email || "—",
        display_name: profileMap[r.user_id]?.display_name || "",
      }))
    );
    setLoadingUsers(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: { email, password, display_name: displayName || email, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Användare ${email} skapad som ${roleLabels[newRole]?.label || newRole}`);
      setEmail("");
      setPassword("");
      setDisplayName("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Kunde inte skapa användare");
    } finally {
      setCreating(false);
    }
  };

  // Determine which roles the current user can create
  const creatableRoles: AppRole[] = isHqAdmin
    ? ["hq_admin", "hq_team", "city_team"]
    : isHqTeam
    ? ["city_team"]
    : [];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Inställningar</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Ditt konto</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">E-post</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roll</span>
            <div className="flex items-center gap-1.5">
              {roleLabels[role || ""]?.icon}
              <Badge className="capitalize">{roleLabels[role || ""]?.label || role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Alla användare</CardTitle></CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Inga användare hittade</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Roll</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={`${u.user_id}-${u.role}`}>
                    <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {roleLabels[u.role]?.icon}
                        <span className="text-sm">{roleLabels[u.role]?.label || u.role}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create user form */}
      {canCreateUsers && (
        <Card>
          <CardHeader><CardTitle className="text-base">Skapa ny användare</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-post</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@wowfoundation.se" />
                </div>
                <div className="space-y-2">
                  <Label>Lösenord</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 tecken" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visningsnamn</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Valfritt" />
                </div>
                <div className="space-y-2">
                  <Label>Roll</Label>
                  <Select value={newRole} onValueChange={(v: AppRole) => setNewRole(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {creatableRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          <div className="flex items-center gap-2">
                            {roleLabels[r]?.icon}
                            <div>
                              <span className="font-medium">{roleLabels[r]?.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">{roleLabels[r]?.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Skapar...</> : "Skapa användare"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isHqAdmin && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Custom Fields</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Hantera custom fields för medlemmar och events. Kommer snart.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Importera medlemmar</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">CSV-import med kolumnmappning. Kommer snart.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">GDPR-verktyg</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Exportera persondata, radera/anonymisera medlemmar. Kommer snart.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
