"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)]">
        <main className="mx-auto max-w-5xl space-y-6 p-4">
          <title>Application Error | Assessment Service</title>
          <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] p-6 shadow-[0_18px_40px_rgba(20,53,43,0.08)] sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Application error
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-inkl sm:text-base">
              A root-level error interrupted the app shell before the normal layout could finish
              rendering.
            </p>
          </div>

          <StateMessage
            tone="error"
            title="The application shell failed to render"
            description={
              <>
                Retry the request. If this continues, return to the dashboard after the underlying
                issue is resolved.
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
        </main>
      </body>
    </html>
  );
}
