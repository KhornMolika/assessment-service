import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMockBankDetailPageData } from "@/src/components/content/api/content.api";
import BankDetailView from "@/src/components/content/components/bank/detail/BankDetailView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function BankDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { bank, bankQuestions } = await getMockBankDetailPageData(id);

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
