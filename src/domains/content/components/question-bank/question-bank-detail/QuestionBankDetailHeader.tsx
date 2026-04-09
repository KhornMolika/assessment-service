"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import type { Bank } from "@/src/domains/content/types";

export default function QuestionBankDetailHeader({
  bank,
  onDelete,
}: {
  bank: Bank;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl bg-linear-to-br from-[#2D6A4F] via-[#2D6A4F] to-[#40916C] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center">
        <Link
          href="/banks"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
          aria-label="Back to bank"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="ml-3 text-2xl font-bold text-white">Bank Detail</h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{bank.name}</h2>
          <p className="mt-1 text-sm text-white/75">{bank.description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/questions?bank=${bank.id}`}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            View questions
          </Link>
          <Link
            href={`/banks/${bank.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-acc px-4 py-2 text-sm font-bold text-primary transition hover:bg-[#95D5B2]"
          >
            <Edit className="h-4 w-4" />
            Edit bank
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            <Trash2 className="h-4 w-4" />
            Delete bank
          </button>
        </div>
      </div>
    </div>
  );
}
