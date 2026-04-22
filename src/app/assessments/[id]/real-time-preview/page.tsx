import { notFound } from "next/navigation";
import {
  getAssessmentCatalogItemById,
  getAssessmentDetailPageData,
} from "@/src/domains/assessment/api/assessment.api";
import { AssessmentPreviewScreen } from "@/src/domains/assessment/components/session/AssessmentSessionScreens";

export default async function AssessmentRealTimePreviewPage({
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
      previewMode="REAL_TIME"
      backHref={`/assessments/${assessment.id}`}
    />
  );
}
