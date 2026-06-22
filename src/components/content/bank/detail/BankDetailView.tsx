"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteBankModal from "@/src/components/content/bank/DeleteBankModal";
import type { Question } from "@/src/types/api";
import type { QuestionBank } from "@/src/types/api";
import BankDetailHeader from "./BankDetailHeader";
import BankRecentQuestions from "./BankRecentQuestions";
import BankMetadataCard from "./BankMetadataCard";
import BankTaxonomyCard from "./BankTaxonomyCard";

export default function BankDetailView({
  bank,
  bankQuestions,
}: {
  bank: QuestionBank;
  bankQuestions: Question[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <BankDetailHeader bank={bank} onDelete={() => setDeleteOpen(true)} />

          <div className="grid gap-6 lg:grid-cols-2">
            <BankMetadataCard bank={bank} />
            <BankTaxonomyCard bank={bank} />
          </div>

          <BankRecentQuestions bankName={bank.name} questions={bankQuestions} />
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
