"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { fetchBankById } from "@/src/actions/bank-actions";
import BankEditForm from "@/src/components/content/bank/edit/BankEditForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import type { QuestionBank } from "@/src/types/api";

function EditBankPageContent() {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return <BankEditForm bank={bank} />;
}

export default function EditBankPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <EditBankPageContent />
    </Suspense>
  );
}
