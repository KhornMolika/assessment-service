import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBankById, getTopics } from "@/src/api/content.api";
import BankEditForm from "@/src/components/content/bank/edit/BankEditForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function EditBankPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bank, topics] = await Promise.all([getBankById(id), getTopics()]);

  if (!bank) {
    notFound();
  }

  return <BankEditForm bank={bank} topics={topics} />;
}

export default function EditBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <EditBankPageContent params={params} />
    </Suspense>
  );
}
