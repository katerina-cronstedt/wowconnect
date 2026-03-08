import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState({ members: 0, events: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const [totalRes, activeRes, eventsRes] = await Promise.all([
        supabase.from("people").select("id", { count: "exact", head: true }),
        supabase.from("people").select("id", { count: "exact", head: true }).eq("engagement_status", "Active"),
        supabase.from("events").select("id", { count: "exact", head: true }),
      ]);

      const total = totalRes.count || 0;
      const active = activeRes.count || 0;

      setStats({
        members: total,
        events: eventsRes.count || 0,
        active,
        inactive: total - active,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Members", value: stats.members, icon: Users, color: "text-primary", link: "/admin/members" },
    { title: "Events", value: stats.events, icon: Calendar, color: "text-accent", link: "/admin/events" },
    { title: "Active", value: stats.active, icon: UserCheck, color: "text-green-600", link: "/admin/members?status=Active" },
    { title: "Inactive", value: stats.inactive, icon: UserX, color: "text-muted-foreground", link: "/admin/members?status=Inactive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(card.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? "—" : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
