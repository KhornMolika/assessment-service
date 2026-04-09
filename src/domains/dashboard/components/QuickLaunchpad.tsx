import Link from "next/link";
import { ClipboardList, Library, Radio, type LucideIcon } from "lucide-react";
import type { QuickLaunchpadItem } from "@/src/domains/dashboard/types/dashboard.types";
import DashboardSectionCard from "./DashboardSectionCard";

const launchpadIconMap: Record<QuickLaunchpadItem["icon"], LucideIcon> = {
  library: Library,
  clipboardList: ClipboardList,
  radio: Radio,
};

export default function QuickLaunchpad({
  items,
}: {
  items: QuickLaunchpadItem[];
}) {
  return (
    <DashboardSectionCard
      title="Quick launchpad"
      description="Jump into the areas creators use most."
    >
      <div className="grid gap-3">
        {items.map((item) => {
          const Icon = launchpadIconMap[item.icon];

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-xl border border-border p-6 transition hover:border-pm hover:bg-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-primary">{item.title}</div>
                  <p className="mt-1 text-sm text-inkd">{item.description}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-acc/10 text-pm transition group-hover:bg-card">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardSectionCard>
  );
}
