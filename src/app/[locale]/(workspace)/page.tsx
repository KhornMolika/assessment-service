import { Suspense } from "react";
import DashboardPageView from "@/src/components/dashboard/DashboardPageView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export default function DashboardPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <DashboardPageView />
    </Suspense>
  );
}
