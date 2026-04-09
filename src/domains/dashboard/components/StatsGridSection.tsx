import { ClipboardList, HelpCircle, Library, Radio, type LucideIcon } from "lucide-react";
import type { DashboardStat } from "@/src/domains/dashboard/types/dashboard.types";
import StatCard from "./StatCard";

const statIconMap: Record<DashboardStat["icon"], LucideIcon> = {
  radio: Radio,
  clipboardList: ClipboardList,
  helpCircle: HelpCircle,
  library: Library,
};

export default function StatsGridSection({
  items,
}: {
  items: DashboardStat[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = statIconMap[item.icon];

        return (
          <StatCard
            key={item.id}
            label={item.label}
            value={item.value}
            helper={item.helper}
            icon={Icon}
            tone={item.tone}
          />
        );
      })}
    </div>
  );
}
