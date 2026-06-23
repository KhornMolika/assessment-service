"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { EditQuestionBankFormData } from "@/src/types";
import { type QuestionBank, BankVisibility } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { questionBankFormSchema } from "@/src/schemas/question-bank-form.schema";
import { updateQuestionBank } from "@/src/actions/bank-actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import BankEditHeader from "./BankEditHeader";
import BankEditPreviewCard from "./BankEditPreviewCard";
import BankFormDetailsCard from "@/src/components/content/bank-form/BankFormDetailsCard";

const editFormId = "question-bank-edit-form";

function toInitialFormData(bank: QuestionBank): EditQuestionBankFormData {
  return {
    name: bank.name,
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

export default function BankEditForm({
  bank,
}: {
  bank: QuestionBank;
}) {
  const router = useRouter();
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
        await updateQuestionBank(bank.id, {
          name: formData.name,
          description: formData.description,
          tags: normalizeTags(formData.tags),
          visibility: formData.visibility,
        });
        toast.success("Question bank updated successfully");
        router.push("/banks");
      } catch (err: any) {
        toast.error("Failed to update bank", {
          description: err.message || "An unexpected error occurred",
        });
        setValidationErrors([err.message || "Failed to update bank"]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <BankEditHeader formId={editFormId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="flex-1">
          <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
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

            <fieldset disabled={isPending} className="space-y-6">
              <BankFormDetailsCard
                formData={formData}
                onChange={handleChange}
                description="Update the title, summary, visibility, and tags to keep this bank easy to understand and discover."
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
