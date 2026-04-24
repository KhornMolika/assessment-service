"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] p-4">
      <PageHeaderCard
        title="Something went wrong"
        description="The page hit an unexpected runtime error while rendering this route segment."
      />

      <StateMessage
        tone="error"
        title="The request could not be completed"
        description={
          <>
            Try the request again. If the issue continues, navigate back to a stable page and
            re-open this screen.
            {error.digest ? (
              <span className="mt-2 block text-xs text-inkd">
                Error reference: {error.digest}
              </span>
            ) : null}
          </>
        }
        action={
          <>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-pm"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              Open dashboard
            </Link>
          </>
        }
      />
    </div>
  );
}
