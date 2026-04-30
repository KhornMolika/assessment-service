import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AssessmentNewHeader({
  title = "Create New Assessment",
  description = "Configure delivery, choose questions, and shape participant experience before launch.",
  cancelHref = "/assessments",
  cancelLabel = "Cancel",
}: {
  title?: string;
  description?: string;
  cancelHref?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-row justify-start gap-4">
        <Link
          href={cancelHref}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary transition hover:bg-muted"
          aria-label="Back to assessments"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          <p className="mt-1 text-sm text-inkd">{description}</p>
        </div>
      </div>
      <Link
        href={cancelHref}
        className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto"
      >
        {cancelLabel}
      </Link>
    </div>
  );
}
