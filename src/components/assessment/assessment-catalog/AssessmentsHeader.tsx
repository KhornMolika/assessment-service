"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";
import { IntegrationModal } from "@/src/components/ui/modals/IntegrationModal";

export default function AssessmentsHeader({
  totalAssessments,
}: {
  totalAssessments: number;
}) {
  const [integrationOpen, setIntegrationOpen] = useState(false);

  return (
    <>
      <PageHeaderCard
        className="catalog-header"
        title="Assessments"
        description={`${totalAssessments} assessments across draft, live delivery, and completed runs.`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row embed-only-element">
            <Button
              type="button"
              onClick={() => setIntegrationOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
            >
              <Copy className="h-4 w-4" />
              Integrate Builder
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

      <IntegrationModal
        open={integrationOpen}
        onClose={() => setIntegrationOpen(false)}
        componentName="Assessment Dashboard"
        componentExport="AssessmentDashboard"
        description="Embed the Assessment dashboard into your application to allow users to view and manage assessments."
        embedPath="/assessments"
      />
    </>
  );
}
