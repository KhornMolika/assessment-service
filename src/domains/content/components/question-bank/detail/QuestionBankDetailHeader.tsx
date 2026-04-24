"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import type { Bank } from "@/src/domains/content/types";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

export default function QuestionBankDetailHeader({
  bank,
  onDelete,
}: {
  bank: Bank;
  onDelete: () => void;
}) {
  return (
    <PageHeaderCard
      backHref="/banks"
      backLabel="Back to banks"
      title={bank.name}
      description={bank.description}
      actions={
        <>
          <Link
            href={`/questions?bank=${bank.id}`}
            className="rounded-xl border border-border px-4 py-2.5 text-center text-sm font-semibold text-primary transition hover:bg-muted"
          >
            View questions
          </Link>
          <Link
            href={`/banks/${bank.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D8F3DC] px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-[#B7E4C7]"
          >
            <Edit className="h-4 w-4" />
            Edit bank
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete bank
          </button>
        </>
      }
    />
  );
}
