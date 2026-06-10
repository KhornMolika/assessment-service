import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { AssessmentHostScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";
import { AssessmentSessionLoading } from "@/src/components/assessment/session/AssessmentSessionLoading";

async function AssessmentHostPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [assessment, detail] = await Promise.all([
    getAssessmentCatalogItemById(id),
    getAssessmentDetailPageData(id),
  ]);

  if (!assessment || !detail) {
    notFound();
  }

  return <AssessmentHostScreen assessment={assessment} questions={detail.questions} />;
}

export default function AssessmentHostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentSessionLoading />}>
      <AssessmentHostPageContent params={params} />
    </Suspense>
  );
}
