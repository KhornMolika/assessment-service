"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { fetchBankById } from "@/src/actions/bank-actions";
import BankDuplicateForm from "@/src/components/content/bank/duplicate/BankDuplicateForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import type { QuestionBank } from "@/src/types/api";

function DuplicateBankPageContent() {
  const params = useParams();
  const id = params.id as string;
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBank() {
      try {
        const fetchedBank = await fetchBankById(id);
        if (isMounted) setBank(fetchedBank);
      } catch (err) {
        if (isMounted) setBank(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBank();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <WorkspacePageSkeleton />;
  }

  if (!bank) {
    notFound();
  }

  return <BankDuplicateForm bank={bank} />;
}

export default function DuplicateBankPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <DuplicateBankPageContent />
    </Suspense>
  );
}
