import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById } from "@/src/domains/assessment/api/assessment.api";
import { AssessmentJoinScreen } from "@/src/domains/assessment/components/session/AssessmentSessionScreens";

export default async function AssessmentJoinPage({
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
