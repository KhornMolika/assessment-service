import { Suspense } from "react";
import BankNewForm from "@/src/components/content/components/bank/new/BankNewForm";
import { getMockTopics } from "@/src/components/content/api/content.api";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

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
