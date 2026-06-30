"use client";

import { Suspense } from "react";
import { AssessmentsPageContent } from "@/src/app/(workspace)/assessments/page";
import AssessmentsCatalogLoading from "@/src/components/assessment/assessment-catalog/AssessmentsCatalogLoading";

export default function EmbeddedAssessmentsPage() {
  return (
    <Suspense fallback={<AssessmentsCatalogLoading />}>
      <AssessmentsPageContent isEmbed={true} />
    </Suspense>
  );
}
