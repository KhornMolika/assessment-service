import Link from "next/link";
import { Plus } from "lucide-react";

export default function AssessmentsHeader({
  totalAssessments,
}: {
  totalAssessments: number;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Assessments</h1>
        <p className="mt-1 text-inkd">
          {totalAssessments} assessments across draft, live delivery, and completed runs.
        </p>
      </div>

      <Link
        href="/assessments/new"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-60"
      >
        <Plus className="h-4 w-4" />
        New assessment
      </Link>
    </div>
  );
}
