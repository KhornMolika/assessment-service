import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/domains/assessment/api/assessment.api";
import { AssessmentTakeScreen } from "@/src/domains/assessment/components/session/AssessmentSessionScreens";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAssessmentDetailPageData(id);

  if (!detail) {
    return {
      title: "Assessment Not Found",
    };
  }

  const title = `Take ${detail.assessment.title}`;
  const description =
    detail.assessment.subtitle ||
    `Join and complete ${detail.assessment.title} in self-paced mode.`;
  const url = `/assessments/${detail.assessment.id}/take`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

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
