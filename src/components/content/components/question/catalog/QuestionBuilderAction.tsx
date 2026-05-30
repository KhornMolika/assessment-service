"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

const questionBuilderSnippet = `<QuestionBuilder
  tenantId="tenant-id"
  topicId="topic-id"
  questionId="question-id"
/>`;

export default function QuestionBuilderAction() {
  const [copied, setCopied] = useState(false);

  async function handleCopyQuestionBuilder() {
    await navigator.clipboard.writeText(questionBuilderSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopyQuestionBuilder()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto"
    >
      <Copy className="h-4 w-4" />
      {copied ? "Copied" : "Question Builder"}
    </button>
  );
}
