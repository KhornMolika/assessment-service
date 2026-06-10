import { Suspense } from "react";
import BankNewForm from "@/src/components/content/components/bank/new/BankNewForm";
import { getTopics } from "@/src/components/content/api/content.api";
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
