"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";

const bankBuilderSnippet = `<BankBuilder
  tenantId="tenant-id"
  topicId="topic-id"
  bankId="bank-id"
/>`;

export default function BanksHeader({
  bankCount,
  totalQuestions,
}: {
  bankCount: number;
  totalQuestions: number;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyBankBuilder() {
    await navigator.clipboard.writeText(bankBuilderSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <PageHeaderCard
      title="Question Banks"
      description={`${bankCount} banks · ${totalQuestions} reusable questions`}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => void handleCopyBankBuilder()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Bank Builder"}
          </button>
          <Link
            href="/banks/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-60"
          >
            <Plus className="h-4 w-4" />
            New bank
          </Link>
        </div>
      }
    />
  );
}
