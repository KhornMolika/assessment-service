import { Suspense } from "react";
import BankNewForm from "@/src/components/content/bank/new/BankNewForm";
import { getTopics } from "@/src/api/topic.api";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function NewBanksPageContent() {
  const topics = await getTopics();

  return <BankNewForm topics={topics} />;
}

export default function NewBanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <NewBanksPageContent />
    </Suspense>
  );
}
