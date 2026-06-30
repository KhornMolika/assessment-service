"use client";

import { Suspense } from "react";
import { BanksPageContent } from "@/src/app/(workspace)/banks/page";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export default function EmbeddedBanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BanksPageContent isEmbed={true} />
    </Suspense>
  );
}
