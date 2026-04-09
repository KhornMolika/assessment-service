import type { CreatorSnapshotItem } from "@/src/domains/dashboard/types/dashboard.types";
import DashboardSectionCard from "./DashboardSectionCard";

export default function CreatorSnapshot({
  items,
}: {
  items: CreatorSnapshotItem[];
}) {
  return (
    <DashboardSectionCard
      title="Creator snapshot"
      description="A compact view of the workspace footprint."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted px-4 py-4.5"
          >
            <span className="text-sm text-inkd">{item.label}</span>
            <span className="text-base font-semibold text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
