"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteBankModal from "@/src/components/content/bank/DeleteBankModal";
import type { Question } from "@/src/types/api";
import type { QuestionBank } from "@/src/types/api";
import BankDetailHeader from "./BankDetailHeader";
import BankRecentQuestions from "./BankRecentQuestions";
import BankMetadataCard from "./BankMetadataCard";

export default function BankDetailView({
  bank,
  bankQuestions,
  onRefresh,
}: {
  bank: QuestionBank;
  bankQuestions: Question[];
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="w-full space-y-6">
        <BankDetailHeader bank={bank} onDelete={() => setDeleteOpen(true)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            <BankRecentQuestions bankId={bank.id} bankName={bank.name} questions={bankQuestions} onRefresh={onRefresh} />
          </div>

          {/* Right Sidebar Area */}
          <div className="flex flex-col gap-6">
            <BankMetadataCard bank={bank} />
          </div>
        </div>
      </div>

      <DeleteBankModal
        open={deleteOpen}
        bank={bank}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          router.refresh();          router.push("/banks");
        }}
      />
    </>
  );
}
