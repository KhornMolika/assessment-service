import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById } from "@/src/components/assessment/api/assessment.api";
import { AssessmentJoinScreen } from "@/src/components/assessment/components/session/AssessmentSessionScreens";
import { AssessmentSessionLoading } from "@/src/components/assessment/components/session/AssessmentSessionLoading";

async function AssessmentJoinPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    notFound();
  }

  return <AssessmentJoinScreen assessment={assessment} />;
}

export default function AssessmentJoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentSessionLoading />}>
      <AssessmentJoinPageContent params={params} />
    </Suspense>
  );
}
