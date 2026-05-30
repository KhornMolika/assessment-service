import Link from "next/link";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";

export default function NotFound() {
  return (
    <div className="space-y-6 p-4">
      <PageHeaderCard
        title="Page not found"
        description="The page may have been moved, the identifier may be invalid, or the URL does not exist in this workspace."
      />

      <StateMessage
        tone="not-found"
        title="We could not find that resource"
        description="Check the URL or return to one of the main workspace sections."
        action={
          <>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-pm"
            >
              Open dashboard
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              Open assessments
            </Link>
          </>
        }
      />
    </div>
  );
}
