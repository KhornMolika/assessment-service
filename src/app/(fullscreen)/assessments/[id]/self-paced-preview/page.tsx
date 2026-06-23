import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getAssessmentCatalogItemById,
  getAssessmentDetailPageData,
} from "@/src/api/assessment.api";
import { AssessmentPreviewScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";
import { AssessmentSessionLoading } from "@/src/components/assessment/session/AssessmentSessionLoading";

async function AssessmentSelfPacedPreviewPageContent({
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

  return (
    <AssessmentPreviewScreen
      assessment={detail.assessment}
      questions={detail.questions}
      previewMode="SELF_PACED"
      backHref={`/assessments/${assessment.id}`}
    />
  );
}

export default function AssessmentSelfPacedPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentSessionLoading />}>
      <AssessmentSelfPacedPreviewPageContent params={params} />
    </Suspense>
  );
}
