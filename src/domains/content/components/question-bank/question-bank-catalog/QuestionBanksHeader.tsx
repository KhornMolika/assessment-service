import Link from "next/link";
import { Plus } from "lucide-react";

export default function QuestionBanksHeader({
  bankCount,
  totalQuestions,
}: {
  bankCount: number;
  totalQuestions: number;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Question Banks</h1>
        <p className="mt-1 text-inkd">
          {bankCount} banks · {totalQuestions} reusable questions
        </p>
      </div>
      <Link
          href="/banks/new"
          className="inline-flex items-center justify-center gap-2 w-60 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm"
        >
          <Plus className="h-4 w-4" />
          New bank
        </Link>
    </div>
  );
}
