import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ask / Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="e.g. Arabic speakers in Stockholm, attendees for all lunches in March 2026..." className="pl-9" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Structured query builder — use filters below. Natural language search coming in V2.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Members by City</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Connect data to see chart. Coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Active vs Inactive</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Engagement breakdown chart. Coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">RSVP Conversion</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Per event + per city. Coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Language Distribution</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Language breakdown per city. Coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
