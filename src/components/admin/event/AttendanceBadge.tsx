import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  arrived: { label: "Närvarande", className: "bg-green-100 text-green-800 border-green-200" },
  late: { label: "Kom sent", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  excused: { label: "Meddelat förhinder", className: "bg-orange-100 text-orange-800 border-orange-200" },
  no_show: { label: "No-show", className: "bg-red-100 text-red-800 border-red-200" },
  walk_in: { label: "Walk-in", className: "bg-blue-100 text-blue-800 border-blue-200" },
};

export default function AttendanceBadge({ status, source }: { status?: string; source?: string }) {
  if (source === "walk_in" && !status) {
    const cfg = statusConfig.walk_in;
    return <Badge variant="outline" className={cn("capitalize", cfg.className)}>{cfg.label}</Badge>;
  }
  if (!status) return <span className="text-xs text-muted-foreground">—</span>;
  const cfg = statusConfig[status] || { label: status, className: "" };
  return <Badge variant="outline" className={cn("capitalize", cfg.className)}>{cfg.label}</Badge>;
}

export function RsvpBadge({ response }: { response?: string }) {
  if (!response) return <span className="text-xs text-muted-foreground">—</span>;
  if (response === "yes") return <Badge className="bg-green-600 hover:bg-green-700">Ja</Badge>;
  if (response === "no") return <Badge variant="destructive">Nej</Badge>;
  return <Badge variant="secondary">{response}</Badge>;
}
