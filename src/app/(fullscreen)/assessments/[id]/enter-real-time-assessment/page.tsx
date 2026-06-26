import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById } from "@/src/api/assessment.api";
import { EnterRealTimeScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

async function AssessmentEnterRealTimePageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    notFound();
  }

  return <EnterRealTimeScreen assessment={assessment} />;
}

export default function AssessmentEnterRealTimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentEnterRealTimePageContent params={params} />
    </Suspense>
  );
}
