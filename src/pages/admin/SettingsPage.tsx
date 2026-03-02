import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, role } = useAuth();

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
