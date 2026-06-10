"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

const assessmentBuilderSnippet = `<AssessmentBuilder
  tenantId="tenant-id"
  topicId="topic-id"
  assessmentId="assessment-id"
/>`;

export default function AssessmentsHeader({
  totalAssessments,
}: {
  totalAssessments: number;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyAssessmentBuilder() {
    await navigator.clipboard.writeText(assessmentBuilderSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <PageHeaderCard
      title="Assessments"
      description={`${totalAssessments} assessments across draft, live delivery, and completed runs.`}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleCopyAssessmentBuilder()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Assessment Builder"}
          </Button>
          <Link
            href="/assessments/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-60"
          >
            <Plus className="h-4 w-4" />
            New assessment
          </Link>
        </div>
      }
    />
  );
}
