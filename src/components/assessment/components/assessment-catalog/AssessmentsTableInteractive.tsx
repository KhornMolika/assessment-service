"use client";

import { useState } from "react";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import AssessmentsTable from "./AssessmentsTable";

export default function AssessmentsTableInteractive({
  assessments,
}: {
  assessments: AssessmentCatalogItem[];
}) {
  const [catalogAssessments, setCatalogAssessments] = useState(assessments);

  const handleDeleteAssessment = (assessmentId: string) => {
    setCatalogAssessments((currentAssessments) =>
      currentAssessments.filter((assessment) => assessment.id !== assessmentId),
    );
  };

  const handleDuplicateAssessment = (assessment: AssessmentCatalogItem) => {
    setCatalogAssessments((currentAssessments) => {
      const duplicate: AssessmentCatalogItem = {
        ...assessment,
        id: `copy-${assessment.id}-${currentAssessments.length + 1}`,
        title: `${assessment.title} (Copy)`,
        lifecycle: "DRAFT",
        participant_count: 0,
        pass_rate: "-",
        average_score: "-",
      };

      return [duplicate, ...currentAssessments];
    });
  };

  return (
    <AssessmentsTable
      assessments={catalogAssessments}
      onDuplicateAssessment={handleDuplicateAssessment}
      onDeleteAssessment={handleDeleteAssessment}
    />
  );
}
