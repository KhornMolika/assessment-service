"use client";

import { useState, useEffect } from "react";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import AssessmentsTable from "./AssessmentsTable";

export default function AssessmentsTableInteractive({
  assessments,
}: {
  assessments: AssessmentCatalogItem[];
}) {
  const [catalogAssessments, setCatalogAssessments] = useState(assessments);

  useEffect(() => {
    setCatalogAssessments(assessments);
  }, [assessments]);

  return (
    <AssessmentsTable
      assessments={catalogAssessments}
    />
  );
}
