import {
  Activity,
  Clock3,
  FileText,
  PlayCircle,
  Radio,
  TimerReset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AssessmentCatalogStats } from "@/src/domains/assessment/types/assessment-catalog.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

const statCards: Array<{
  key: keyof AssessmentCatalogStats;
  label: string;
  helper: string;
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
  eyebrowClassName: string;
}> = [
  {
    key: "totalAssessments",
    label: "Total assessments",
    helper: "Everything currently tracked in the workspace catalog.",
    icon: FileText,
    cardClassName: "border-emerald-200 bg-[linear-gradient(135deg,_#f3fbf6_0%,_#ffffff_65%)]",
    iconClassName: "bg-emerald-100 text-emerald-700",
    eyebrowClassName: "text-emerald-700",
  },
  {
    key: "draftCount",
    label: "Draft",
    helper: "Assessments still being shaped before release.",
    icon: Clock3,
    cardClassName: "border-slate-200 bg-[linear-gradient(135deg,_#f8fafc_0%,_#ffffff_65%)]",
    iconClassName: "bg-slate-100 text-slate-700",
    eyebrowClassName: "text-slate-700",
  },
  {
    key: "activeCount",
    label: "Active",
    helper: "Assessments currently available to participants.",
    icon: PlayCircle,
    cardClassName: "border-blue-200 bg-[linear-gradient(135deg,_#f1f7ff_0%,_#ffffff_65%)]",
    iconClassName: "bg-blue-100 text-blue-700",
    eyebrowClassName: "text-blue-700",
  },
  {
    key: "selfPacedCount",
    label: "Self-paced",
    helper: "Flexible delivery without synchronized start timing.",
    icon: TimerReset,
    cardClassName: "border-amber-200 bg-[linear-gradient(135deg,_#fff8eb_0%,_#ffffff_65%)]",
    iconClassName: "bg-amber-100 text-amber-700",
    eyebrowClassName: "text-amber-700",
  },
  {
    key: "realTimeCount",
    label: "Real-time",
    helper: "Coordinated live sessions with fixed launch windows.",
    icon: Radio,
    cardClassName: "border-fuchsia-200 bg-[linear-gradient(135deg,_#fff3fb_0%,_#ffffff_65%)]",
    iconClassName: "bg-fuchsia-100 text-fuchsia-700",
    eyebrowClassName: "text-fuchsia-700",
  },
  {
    key: "startingThisWeekCount",
    label: "Starting this week",
    helper: "Runs that are scheduled to launch during the current week.",
    icon: Activity,
    cardClassName: "border-cyan-200 bg-[linear-gradient(135deg,_#effcff_0%,_#ffffff_65%)]",
    iconClassName: "bg-cyan-100 text-cyan-700",
    eyebrowClassName: "text-cyan-700",
  },
];

export default function AssessmentsStats({
  stats,
}: {
  stats: AssessmentCatalogStats;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className={`overflow-hidden ${card.cardClassName}`}>
            <CardHeader className="relative flex flex-row items-start justify-between space-y-0">
              <div className="space-y-2">
                <CardDescription className={`text-xs font-semibold uppercase tracking-[0.18em] ${card.eyebrowClassName}`}>
                  {card.label}
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{stats[card.key]}</CardTitle>
              </div>
              <div className={`rounded-2xl p-2.5 shadow-sm ${card.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-inkd">{card.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
