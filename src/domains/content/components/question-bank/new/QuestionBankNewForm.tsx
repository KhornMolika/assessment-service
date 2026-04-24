"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { questionBankFormSchema } from "@/src/domains/content/schemas/question-bank-form.schema";
import type { Topic } from "@/src/domains/content/types/topic.types";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import QuestionBankNewHeader from "./QuestionBankNewHeader";
import { NewQuestionBankFormData } from "../../../types/question-bank-form.types";

const createFormId = "question-bank-new-form";

const initialFormData: NewQuestionBankFormData = {
  name: "",
  description: "",
  tags: "",
  visibility: "ORG",
  ownerTopicId: "",
};

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function QuestionBankNewForm({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState<NewQuestionBankFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = questionBankFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(new Set(validationResult.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    console.log("Creating bank:", {
      ...formData,
      tags: normalizeTags(formData.tags),
    });

    router.push("/banks");
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <QuestionBankNewHeader formId={createFormId} />

      <Card>
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
        <CardDescription>
          Give this bank a clear name, a useful summary, and tags people can actually search for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
          {validationErrors.length > 0 ? (
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
          ) : null}

          <div className="space-y-2">
            <label htmlFor="bank-name" className="block text-sm font-semibold text-primary">
              Bank name *
              </label>
              <input
                id="bank-name"
                type="text"
                placeholder="e.g. Mathematics - Grade 11"
                value={formData.name}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, name: event.target.value }));
                  setValidationErrors([]);
                }}
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <label htmlFor="bank-description" className="block text-sm font-semibold text-primary">
                  Description
                </label>
                <textarea
                  id="bank-description"
                  placeholder="Briefly describe the type of questions this bank should contain"
                  value={formData.description}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, description: event.target.value }));
                    setValidationErrors([]);
                  }}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bank-owner-topic" className="block text-sm font-semibold text-primary">
                  Owner Topic
                </label>
                <select
                  id="bank-owner-topic"
                  value={formData.ownerTopicId}
                  onChange={(event) =>
                    {
                      setFormData((current) => ({ ...current, ownerTopicId: event.target.value }));
                      setValidationErrors([]);
                    }
                  }
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                >
                  <option value="">Select a topic owner</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-inkd">
                  Assign the primary topic owner for this bank.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="bank-visibility" className="block text-sm font-semibold text-primary">
                  Visibility
                </label>
                <select
                  id="bank-visibility"
                  value={formData.visibility}
                  onChange={(event) =>
                    {
                      setFormData((current) => ({
                        ...current,
                        visibility: event.target.value as NewQuestionBankFormData["visibility"],
                      }));
                      setValidationErrors([]);
                    }
                  }
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="ORG">Organization</option>
                  <option value="PUBLIC">Public</option>
                </select>
                <p className="text-xs text-inkd">
                  Choose who can discover and reuse this bank once it is published.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bank-tags" className="block text-sm font-semibold text-primary">
                Tags
              </label>
              <input
                id="bank-tags"
                type="text"
                placeholder="e.g. Math, Grade 10, Midterm"
                value={formData.tags}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, tags: event.target.value }));
                  setValidationErrors([]);
                }}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
              />
              <p className="text-xs text-inkd">Separate tags with commas.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
