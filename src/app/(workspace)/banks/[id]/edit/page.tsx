import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMockBankById, getMockTopics } from "@/src/domains/content/api/content.api";
import BankEditForm from "@/src/domains/content/components/bank/edit/BankEditForm";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

async function EditBankPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bank, topics] = await Promise.all([getMockBankById(id), getMockTopics()]);

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
