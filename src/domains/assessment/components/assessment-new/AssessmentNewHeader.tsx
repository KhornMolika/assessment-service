import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AssessmentNewHeader({
  title = "Create New Assessment",
  description = "Configure delivery, choose questions, and shape participant experience before launch.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-row justify-start gap-4">
      <Link
        href="/assessments"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-primary transition hover:bg-muted"
        aria-label="Back to banks"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="flex flex-col gap-3 ">
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
        <p className="mt-1 text-sm text-inkd">{description}</p>
      </div>
    </div>
  );
}
