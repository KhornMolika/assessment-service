"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteBankModal from "@/src/domains/content/components/question-bank/DeleteBankModal";
import type { Bank, QuestionCatalogItem } from "@/src/domains/content/types";
import QuestionBankDetailHeader from "./QuestionBankDetailHeader";
import QuestionBankDetailStats from "./QuestionBankDetailStats";
import QuestionBankMetadataCard from "./QuestionBankMetadataCard";
import QuestionBankTaxonomyCard from "./QuestionBankTaxonomyCard";
import QuestionBankRecentQuestions from "./QuestionBankRecentQuestions";

export default function QuestionBankDetailView({
  bank,
  recentQuestions,
}: {
  bank: Bank;
  recentQuestions: QuestionCatalogItem[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 px-4 py-4 sm:px-6">
        <QuestionBankDetailHeader bank={bank} onDelete={() => setDeleteOpen(true)} />
        <QuestionBankDetailStats bank={bank} />

        <div className="grid gap-6 lg:grid-cols-2">
          <QuestionBankMetadataCard bank={bank} />
          <QuestionBankTaxonomyCard bank={bank} />
        </div>

        <QuestionBankRecentQuestions bankName={bank.name} questions={recentQuestions} />
      </div>

      <DeleteBankModal
        open={deleteOpen}
        bank={bank}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          router.push("/banks");
        }}
      />
    </>
  );
}
