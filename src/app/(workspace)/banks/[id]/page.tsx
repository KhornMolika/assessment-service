"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { fetchBankById, fetchBankQuestions } from "@/src/actions/bank-actions";
import BankDetailView from "@/src/components/content/bank/detail/BankDetailView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import type { QuestionBank, Question } from "@/src/types/api";

function BankDetailPageContent() {
  const params = useParams();
  const id = params.id as string;
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedBank, fetchedQuestions] = await Promise.all([
        fetchBankById(id).catch(() => null),
        fetchBankQuestions(id).catch(() => []),
      ]);

      setBank(fetchedBank);
      setBankQuestions(fetchedQuestions);
    } catch (err) {
      setBank(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return <WorkspacePageSkeleton />;
  }

  if (!bank) {
    notFound();
  }

  return <BankDetailView bank={bank} bankQuestions={bankQuestions} onRefresh={loadData} />;
}

export default function BankDetailPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BankDetailPageContent />
    </Suspense>
  );
}
