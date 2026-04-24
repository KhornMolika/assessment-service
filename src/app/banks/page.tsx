import { Suspense } from "react";
import { getMockBankTopics, getMockBanks } from "@/src/domains/content/api/content.api";
import QuestionBanksCatalog from "@/src/domains/content/components/question-bank/catalog/QuestionBanksCatalog";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Question Banks',
};

export default async function BanksPage() {
  const [banks, bankTopics] = await Promise.all([getMockBanks(), getMockBankTopics()]);

  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionBanksCatalog banks={banks} bankTopics={bankTopics} />
    </Suspense>
  );
}
