import { Calendar, Globe, Tag, Users } from "lucide-react";
import type { Bank } from "@/src/domains/content/types";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityLabel(visibility: Bank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "ORG":
      return "Organization";
    default:
      return "Private";
  }
}

export default function QuestionBankDetailStats({ bank }: { bank: Bank }) {
  const stats = [
    {
      label: "Tags",
      value: `${bank.tags.length}`,
      detail: "Taxonomy labels available for filtering and reuse.",
      icon: Tag,
      iconClassName: "bg-sky-100 text-sky-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(14,165,233,0.15)_0%,rgba(14,165,233,0.85)_50%,rgba(14,165,233,0.15)_100%)]",
    },
    {
      label: "Created",
      value: formatDate(bank.created_at),
      detail: "Original creation date for this question bank.",
      icon: Calendar,
      iconClassName: "bg-amber-100 text-amber-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(245,158,11,0.15)_0%,rgba(245,158,11,0.85)_50%,rgba(245,158,11,0.15)_100%)]",
    },
    {
      label: "Visibility",
      value: getVisibilityLabel(bank.visibility),
      detail: "Controls who can discover and reuse this bank.",
      icon: bank.visibility === "PUBLIC" ? Globe : bank.visibility === "ORG" ? Users : Calendar,
      iconClassName: "bg-violet-100 text-violet-700",
      accentClassName:
        "bg-[linear-gradient(90deg,rgba(139,92,246,0.15)_0%,rgba(139,92,246,0.85)_50%,rgba(139,92,246,0.15)_100%)]",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] p-6 shadow-[0_18px_40px_rgba(20,53,43,0.08)]"
        >
          <div className={`absolute inset-x-0 top-0 h-1 ${stat.accentClassName}`} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
                {stat.label}
              </div>
              <div className="mt-4 text-3xl font-bold tracking-tight text-primary">{stat.value}</div>
              <p className="mt-3 text-sm leading-6 text-inkd">{stat.detail}</p>
            </div>
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${stat.iconClassName}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
