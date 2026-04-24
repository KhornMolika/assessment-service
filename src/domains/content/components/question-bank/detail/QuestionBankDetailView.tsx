"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteBankModal from "@/src/domains/content/components/question-bank/DeleteBankModal";
import type { Bank, QuestionCatalogItem } from "@/src/domains/content/types";
import QuestionBankDetailHeader from "./QuestionBankDetailHeader";
import QuestionBankDetailStats from "./QuestionBankDetailStats";
import QuestionBankAllQuestions from "./QuestionBankRecentQuestions";
import QuestionBankMetadataCard from "./QuestionBankMetadataCard";
import QuestionBankTaxonomyCard from "./QuestionBankTaxonomyCard";

export default function QuestionBankDetailView({
  bank,
  bankQuestions,
}: {
  bank: Bank;
  bankQuestions: QuestionCatalogItem[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
        <QuestionBankDetailHeader bank={bank} onDelete={() => setDeleteOpen(true)} />
        <QuestionBankDetailStats bank={bank} />

        <div className="grid gap-6 lg:grid-cols-2">
          <QuestionBankMetadataCard bank={bank} />
          <QuestionBankTaxonomyCard bank={bank} />
        </div>

        <QuestionBankAllQuestions bankName={bank.name} questions={bankQuestions} />
        </div>
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
