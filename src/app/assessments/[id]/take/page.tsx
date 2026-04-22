import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/domains/assessment/api/assessment.api";
import { AssessmentTakeScreen } from "@/src/domains/assessment/components/session/AssessmentSessionScreens";

export default async function AssessmentTakePage({
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

  return <AssessmentTakeScreen assessment={detail.assessment} questions={detail.questions} />;
}
