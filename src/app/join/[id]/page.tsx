import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ClipboardList, UserRound } from "lucide-react";
import { getAssessmentCatalogItemById } from "@/src/domains/assessment/api/assessment.api";

function formatStartDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AssessmentJoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    notFound();
  }

  const isSelfPaced = assessment.delivery_mode === "SELF_PACED";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_45%),linear-gradient(180deg,#f7f5f0_0%,#f3efe6_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/65">
            Assessment Invite
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {assessment.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-inkd sm:text-base">
            {assessment.description || "You have been invited to complete this assessment."}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-inkd">
                Starts
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatStartDate(assessment.starts_at)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-inkd">
                Questions
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {assessment.question_count} questions
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <UserRound className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-inkd">
                Access
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {assessment.participant_identity === "ANONYMOUS" ? "Anonymous" : "Registered users"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] bg-primary px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Delivery Mode
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {isSelfPaced ? "Self-paced participation" : "Real-time session"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              {isSelfPaced
                ? "Participants can open the assessment and complete it within the configured availability window."
                : "This assessment is configured for a coordinated live run. Join when the host launches the session."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/assessments/${assessment.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Preview assessment
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {isSelfPaced ? "Start assessment" : "Wait for launch"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
