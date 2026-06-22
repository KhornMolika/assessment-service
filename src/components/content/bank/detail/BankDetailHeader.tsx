"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import type { QuestionBank } from "@/src/types/api";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function BankDetailHeader({
  bank,
  onDelete,
}: {
  bank: QuestionBank;
  onDelete: () => void;
}) {
  return (
    <PageHeaderCard
      backHref="/banks"
      backLabel="Back to banks"
      title={bank.name}
      description={bank.description || ""}
      actions={
        <>
          <Link
            href={`/questions?bank=${bank.id}`}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-center text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto"
          >
            View questions
          </Link>
          <Link
            href={`/banks/${bank.id}/edit`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D8F3DC] px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-[#B7E4C7] sm:w-auto"
          >
            <Edit className="h-5 w-5" />
            Edit bank
          </Link>
          <Button
            type="button"
            onClick={onDelete}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 sm:w-auto" variant="outline"
          >
            <Trash2 className="h-5 w-5" />
            Delete bank
          </Button>
        </>
      }
    />
  );
}
