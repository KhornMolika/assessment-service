import { Suspense } from "react";
import { getMockBankTopics, getMockBanks } from "@/src/domains/content/api/content.api";
import BanksCatalog from "@/src/domains/content/components/bank/catalog/BanksCatalog";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Question Banks',
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function BanksPageContent() {
  const [banks, bankTopics] = await Promise.all([getMockBanks(), getMockBankTopics()]);

  return <BanksCatalog banks={banks} bankTopics={bankTopics} />;
}

export default function BanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BanksPageContent />
    </Suspense>
  );
}
