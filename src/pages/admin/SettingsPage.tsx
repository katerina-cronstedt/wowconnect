import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, role, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"hq_admin" | "staff">("staff");
  const [creating, setCreating] = useState(false);

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
      toast.success(`User ${email} created as ${newRole}`);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Your Account</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge className="capitalize">{role}</Badge>
          </div>
        </CardContent>
      </Card>

      {role === "hq_admin" && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Create Admin / Staff User</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@wowfoundation.se" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={(v: "hq_admin" | "staff") => setNewRole(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hq_admin">HQ Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create User"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Custom Fields</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Manage custom fields for members and events. Coming soon.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Import Members</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">CSV import with column mapping. Coming soon.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">GDPR Tools</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Export personal data, delete/anonymize members. Coming soon.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
