import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

export default function AssessmentsHeader({
  totalAssessments,
}: {
  totalAssessments: number;
}) {
  return (
    <PageHeaderCard
      title="Assessments"
      description={`${totalAssessments} assessments across draft, live delivery, and completed runs.`}
      actions={
        <Link
          href="/assessments/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-60"
        >
          <Plus className="h-4 w-4" />
          New assessment
        </Link>
      }
    />
  );
}
