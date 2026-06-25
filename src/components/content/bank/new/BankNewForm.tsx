"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { questionBankFormSchema } from "@/src/schemas/question-bank-form.schema";
import type { Topic } from "@/src/types/topic.types";
import { createQuestionBank } from "@/src/actions/bank-actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { useTopicStore } from "@/src/stores/topic-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import BankNewHeader from "./BankNewHeader";
import { NewQuestionBankFormData } from "@/src/types/question-bank-form.types";
import { BankVisibility } from "@/src/types/api";

const createFormId = "question-bank-new-form";

const initialFormData: NewQuestionBankFormData = {
  name: "",
  description: "",
  tags: "",
  visibility: BankVisibility.SHARED,
};

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

import BankFormDetailsCard from "@/src/components/content/bank-form/BankFormDetailsCard";

export default function BankNewForm() {
  const router = useRouter();
  const topics = useTopicStore((s) => s.topics);
  const activeTopic = useTopicStore((s) => s.activeTopic);

  const [formData, setFormData] = useState<NewQuestionBankFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();

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
        toast.success("Question bank created successfully");
        router.refresh();        router.push("/banks");
      } catch (err: any) {
        toast.error("Failed to create bank", {
          description: err.message || "An unexpected error occurred",
        });
        setValidationErrors([err.message || "Failed to create bank"]);
      }
    });
  };

  const handleChange = <K extends keyof NewQuestionBankFormData>(
    field: K,
    value: NewQuestionBankFormData[K]
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      <BankNewHeader formId={createFormId} disabled={!activeTopic} isPending={isPending} />

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
                You must select a global Topic from the topbar before creating a question bank.
              </p>
            </div>
          </div>
        </div>
      )}

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

      <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isPending || !activeTopic} className="space-y-6">
          <BankFormDetailsCard
            formData={formData}
            onChange={handleChange}
            description="Give this bank a clear name, a useful summary, and tags people can actually search for."
          />
        </fieldset>
      </form>
    </div>
  );
}
