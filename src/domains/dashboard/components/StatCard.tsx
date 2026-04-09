import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/ui/card";

export default function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "accent" | "success" | "warning";
}) {
  const toneStyles =
    tone === "accent"
      ? "border-primary bg-primary text-white"
      : "border-border bg-card text-primary";

  const iconBox =
    tone === "accent"
      ? "bg-white/15 text-white"
      : tone === "success"
        ? "bg-green-50 text-green-700"
        : tone === "warning"
          ? "bg-yellow-50 text-yellow-700"
          : "bg-muted text-primary";

  const helperColor = tone === "accent" ? "text-white/80" : "text-inkd";
  const labelColor = tone === "accent" ? "text-white/70" : "text-inkd";

  return (
    <Card className={toneStyles}>
      <CardContent className="p-5">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBox}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`text-sm font-medium ${labelColor}`}>{label}</div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
        <p className={`mt-3 text-sm ${helperColor}`}>{helper}</p>
      </CardContent>
    </Card>
  );
}
