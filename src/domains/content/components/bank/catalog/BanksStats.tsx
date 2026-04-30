import type { Bank } from "@/src/domains/content/types/bank.types";
import { BookOpen, Globe2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/ui/card";

export default function BanksStats({
  largestBank,
  publicBankCount,
  recentlyCreatedCount,
}: {
  largestBank: Bank | undefined;
  publicBankCount: number;
  recentlyCreatedCount: number;
}) {
  const stats = [
    {
      label: "Largest bank",
      value: `${largestBank?.question_count ?? 0} questions`,
      description: largestBank
        ? `${largestBank.name} is currently the deepest question library.`
        : "No bank data available yet.",
      icon: BookOpen,
      iconClassName: "bg-emerald-100 text-emerald-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(16,185,129,0.15)_0%,rgba(16,185,129,0.85)_50%,rgba(16,185,129,0.15)_100%)]",
      footer: "Tracks the bank with the highest question count",
    },
    {
      label: "Public visibility",
      value: `${publicBankCount} bank${publicBankCount === 1 ? "" : "s"}`,
      description: "Public banks are immediately available for broader discovery and reuse.",
      icon: Globe2,
      iconClassName: "bg-sky-100 text-sky-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(14,165,233,0.15)_0%,rgba(14,165,233,0.85)_50%,rgba(14,165,233,0.15)_100%)]",
      footer: "Highlights banks available to the wider team",
    },
    {
      label: "Recently created",
      value: `${recentlyCreatedCount} this month`,
      description: "Newly created banks make it easier to spot the latest content libraries.",
      icon: Sparkles,
      iconClassName: "bg-amber-100 text-amber-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(245,158,11,0.15)_0%,rgba(245,158,11,0.85)_50%,rgba(245,158,11,0.15)_100%)]",
      footer: "Surfaces the newest bank creation activity",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="relative overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] shadow-[0_18px_40px_rgba(20,53,43,0.08)]"
        >
          <div className={`absolute inset-x-0 top-0 h-1 ${stat.accentClassName}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
                  {stat.label}
                </p>
                <p className="mt-4 text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-inkd">{stat.description}</p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${stat.iconClassName}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-inkd/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--sage)]" />
              <span>{stat.footer}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
