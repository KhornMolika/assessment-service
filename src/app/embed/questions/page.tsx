"use client";

import { Suspense } from "react";
import { QuestionsPageContent } from "@/src/app/(workspace)/questions/page";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export default function EmbeddedQuestionsPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionsPageContent isEmbed={true} />
    </Suspense>
  );
}
