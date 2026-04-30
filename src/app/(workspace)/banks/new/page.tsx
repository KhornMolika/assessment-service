import { Suspense } from "react";
import BankNewForm from "@/src/domains/content/components/bank/new/BankNewForm";
import { getMockTopics } from "@/src/domains/content/api/content.api";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

async function NewBanksPageContent() {
  const topics = await getMockTopics();

  return <BankNewForm topics={topics} />;
}

export default function NewBanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <NewBanksPageContent />
    </Suspense>
  );
}
