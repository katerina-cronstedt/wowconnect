import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, MapPin, Copy, Check, Mail, Link2, MoreHorizontal, Search, UserPlus, KeyRound, Trash2, UserCog } from "lucide-react";

type AppRole = "hq_admin" | "hq_team" | "city_team";

const roleLabels: Record<string, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  hq_admin: { label: "HQ Admin", description: "Full åtkomst", icon: <ShieldCheck className="h-4 w-4" />, color: "bg-destructive/10 text-destructive" },
  hq_team: { label: "HQ Team", description: "Alla städer", icon: <Shield className="h-4 w-4" />, color: "bg-orange-500/10 text-orange-600" },
  city_team: { label: "City Team", description: "Tilldelad stad", icon: <MapPin className="h-4 w-4" />, color: "bg-primary/10 text-primary" },
  staff: { label: "Staff", description: "Legacy", icon: <MapPin className="h-4 w-4" />, color: "bg-muted text-muted-foreground" },
};

const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-destructive text-destructive-foreground",
  "bg-orange-500 text-white",
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface UserWithRole {
  user_id: string;
  role: string;
  email: string;
  display_name: string;
}

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("city_team");
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Change role dialog
  const [changeRoleUser, setChangeRoleUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("city_team");
  const [changingRole, setChangingRole] = useState(false);

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action loading per user
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isHqAdmin = role === "hq_admin";
  const isHqTeam = role === "hq_team";
  const canCreateUsers = isHqAdmin || isHqTeam;

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (!roles) { setLoadingUsers(false); return; }

    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, email, display_name").in("user_id", userIds);
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

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.display_name.toLowerCase().includes(q) ||
      (roleLabels[u.role]?.label || u.role).toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setCreating(true);
    setInviteLink(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: { email, display_name: displayName || email, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setInviteLink(data.invite_link || null);
      toast.success(`Inbjudan skickad till ${email}`);
      setEmail("");
      setDisplayName("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Kunde inte bjuda in användare");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Länk kopierad!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangeRole = async () => {
    if (!changeRoleUser) return;
    setChangingRole(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "change_role", target_user_id: changeRoleUser.user_id, new_role: selectedRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Roll ändrad till ${roleLabels[selectedRole]?.label}`);
      setChangeRoleUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Kunde inte ändra roll");
    } finally {
      setChangingRole(false);
    }
  };

  const handleResetPassword = async (u: UserWithRole) => {
    setActionLoading(u.user_id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "reset_password", target_user_id: u.user_id, email: u.email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.recovery_link) {
        await navigator.clipboard.writeText(data.recovery_link);
        toast.success("Återställningslänk kopierad till urklipp");
      } else {
        toast.success("Återställningslänk skickad");
      }
    } catch (err: any) {
      toast.error(err.message || "Kunde inte generera återställningslänk");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendResetEmail = async (u: UserWithRole) => {
    setActionLoading(u.user_id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "send_reset_email", target_user_id: u.user_id, email: u.email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Återställningslänk skickad till ${u.email}`);
    } catch (err: any) {
      toast.error(err.message || "Kunde inte skicka återställningslänk");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateInviteLink = async (u: UserWithRole) => {
    setActionLoading(u.user_id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "generate_invite_link", target_user_id: u.user_id, email: u.email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.invite_link) {
        await navigator.clipboard.writeText(data.invite_link);
        toast.success("Inbjudningslänk kopierad till urklipp");
      }
    } catch (err: any) {
      toast.error(err.message || "Kunde inte generera länk");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "delete_user", target_user_id: deleteUser.user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Användare borttagen");
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Kunde inte ta bort användare");
    } finally {
      setDeleting(false);
    }
  };

  const creatableRoles: AppRole[] = isHqAdmin
    ? ["hq_admin", "hq_team", "city_team"]
    : isHqTeam ? ["city_team"] : [];

  const canModifyUser = (u: UserWithRole) => {
    if (u.user_id === user?.id) return false;
    if (isHqAdmin) return true;
    if (isHqTeam && u.role === "city_team") return true;
    return false;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inställningar</h1>
      </div>

      {/* Your account */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ditt konto</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">E-post</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roll</span>
            <Badge className={roleLabels[role || ""]?.color}>
              <span className="flex items-center gap-1.5">
                {roleLabels[role || ""]?.icon}
                {roleLabels[role || ""]?.label || role}
              </span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* User management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Användare</CardTitle>
            {canCreateUsers && (
              <Button size="sm" className="gap-1.5" onClick={() => { setInviteOpen(true); setInviteLink(null); }}>
                <UserPlus className="h-4 w-4" />
                Bjud in
              </Button>
            )}
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök namn, e-post eller roll..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? "Inga användare matchade sökningen" : "Inga användare hittade"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Användare</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={`${u.user_id}-${u.role}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(u.user_id)}`}>
                            {(u.display_name || u.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {u.display_name || "—"}
                            {u.user_id === user?.id && (
                              <span className="text-xs text-muted-foreground ml-1.5">(du)</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={roleLabels[u.role]?.color}>
                        <span className="flex items-center gap-1">
                          {roleLabels[u.role]?.icon}
                          {roleLabels[u.role]?.label || u.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canModifyUser(u) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === u.user_id}>
                              {actionLoading === u.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setChangeRoleUser(u); setSelectedRole(u.role as AppRole); }}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Ändra roll
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendResetEmail(u)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Skicka återställningslänk
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(u)}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Kopiera återställningslänk
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateInviteLink(u)}>
                              <Link2 className="h-4 w-4 mr-2" />
                              Kopiera inbjudningslänk
                            </DropdownMenuItem>
                            {isHqAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteUser(u)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Ta bort användare
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bjud in ny användare</DialogTitle>
          </DialogHeader>
          {inviteLink ? (
            <div className="space-y-4">
              <div className="bg-primary/10 text-primary rounded-md p-4 text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4" />
                  Inbjudan skickad!
                </div>
                <p className="text-muted-foreground text-xs">
                  Användaren får ett mail och väljer sitt eget lösenord.
                </p>
              </div>
              <div className="border rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="h-4 w-4" />
                  Inbjudningslänk
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={inviteLink} className="text-xs font-mono" />
                  <Button variant="outline" size="sm" onClick={() => handleCopyLink(inviteLink)} className="shrink-0 gap-1.5">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Kopierad" : "Kopiera"}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setInviteLink(null); }}>Bjud in en till</Button>
                <DialogClose asChild><Button>Klar</Button></DialogClose>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label>E-post</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@wowfoundation.se" />
              </div>
              <div className="space-y-2">
                <Label>Visningsnamn</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Valfritt" />
              </div>
              <div className="space-y-2">
                <Label>Roll</Label>
                <Select value={newRole} onValueChange={(v: string) => setNewRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {creatableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className="flex items-center gap-2">
                          {roleLabels[r]?.icon}
                          <span>{roleLabels[r]?.label}</span>
                          <span className="text-xs text-muted-foreground">— {roleLabels[r]?.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Avbryt</Button></DialogClose>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Skickar...</> : <><Mail className="h-4 w-4" /> Skicka inbjudan</>}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!changeRoleUser} onOpenChange={(o) => !o && setChangeRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ändra roll för {changeRoleUser?.display_name || changeRoleUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ny roll</Label>
              <Select value={selectedRole} onValueChange={(v: string) => setSelectedRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {creatableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className="flex items-center gap-2">
                        {roleLabels[r]?.icon}
                        <span>{roleLabels[r]?.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Avbryt</Button></DialogClose>
              <Button onClick={handleChangeRole} disabled={changingRole} className="gap-2">
                {changingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Spara
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort användare?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort <strong>{deleteUser?.display_name || deleteUser?.email}</strong>? Detta kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin-only settings placeholders */}
      {isHqAdmin && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Custom Fields</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-sm">Hantera custom fields för medlemmar och events. Kommer snart.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Importera medlemmar</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-sm">CSV-import med kolumnmappning. Kommer snart.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">GDPR-verktyg</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-sm">Exportera persondata, radera/anonymisera medlemmar. Kommer snart.</p></CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
