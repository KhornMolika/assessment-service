import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBankById, getBankQuestions } from "@/src/lib/services/banks";
import BankDetailView from "@/src/components/content/bank/detail/BankDetailView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function BankDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bank, bankQuestionsRes] = await Promise.all([
    getBankById(id).catch(() => null),
    getBankQuestions(id, 1, 100).catch(() => ({ data: [] }))
  ]);
  const bankQuestions = bankQuestionsRes?.data || [];

  if (!bank) {
    notFound();
  }

  return <BankDetailView bank={bank} bankQuestions={bankQuestions} />;
}

export default function BankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BankDetailPageContent params={params} />
    </Suspense>
  );
}
