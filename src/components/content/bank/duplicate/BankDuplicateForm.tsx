"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { EditQuestionBankFormData } from "@/src/types";
import { type QuestionBank } from "@/src/types/api";
import { questionBankFormSchema } from "@/src/schemas/question-bank-form.schema";
import { createQuestionBank } from "@/src/actions/bank-actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { useTopicStore } from "@/src/stores/topic-store";
import BankDuplicateHeader from "./BankDuplicateHeader";
import BankEditPreviewCard from "@/src/components/content/bank/edit/BankEditPreviewCard";
import BankFormDetailsCard from "@/src/components/content/bank-form/BankFormDetailsCard";

const duplicateFormId = "question-bank-duplicate-form";

function toInitialFormData(bank: QuestionBank): EditQuestionBankFormData {
  return {
    name: `${bank.name} (Copy)`,
    description: bank.description || "",
    tags: bank.tags ? bank.tags.join(", ") : "",
    visibility: bank.visibility,
  };
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function BankDuplicateForm({
  bank,
}: {
  bank: QuestionBank;
}) {
  const router = useRouter();
  const activeTopic = useTopicStore((s) => s.activeTopic);

  const [formData, setFormData] = useState<EditQuestionBankFormData>(() =>
    toInitialFormData(bank),
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends keyof EditQuestionBankFormData>(
    field: K,
    value: EditQuestionBankFormData[K]
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors([]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeTopic) return;

    const validationResult = questionBankFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(
          new Set(validationResult.error.issues.map((issue) => issue.message)),
        ),
      );
      return;
    }

    setValidationErrors([]);

    startTransition(async () => {
      try {
        await createQuestionBank(activeTopic.id, {
          name: formData.name,
          description: formData.description,
          tags: normalizeTags(formData.tags),
          visibility: formData.visibility,
        });
        toast.success("Question bank duplicated successfully");
        router.refresh();        router.push("/banks");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error("Failed to duplicate bank", {
          description: err.message || "An unexpected error occurred",
        });
        setValidationErrors([err.message || "Failed to create bank"]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <BankDuplicateHeader formId={duplicateFormId} disabled={!activeTopic} isPending={isPending} />

      {!activeTopic && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You must select a global Topic from the topbar before duplicating a question bank.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="flex-1">
          <form id={duplicateFormId} onSubmit={handleSubmit} className="space-y-6">
            {validationErrors.length > 0 && (
              <StateMessage
                tone="error"
                title="Please fix the bank form"
                description={
                  <div className="space-y-1">
                    {validationErrors.map((message) => (
                      <div key={message}>{message}</div>
                    ))}
                  </div>
                }
              />
            )}

            <fieldset disabled={isPending || !activeTopic} className="space-y-6">
              <BankFormDetailsCard
                formData={formData}
                onChange={handleChange}
                description="Give the duplicated bank a new name, adjust the summary, and set tags."
              />
            </fieldset>
          </form>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-primary">Preview</h2>
            <p className="text-sm text-inkd">
              This live preview mirrors the bank card style used in the catalog.
            </p>
          </div>
          <BankEditPreviewCard bank={bank} formData={formData} />
        </div>
      </div>
    </div>
  );
}
