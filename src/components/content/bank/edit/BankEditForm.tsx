"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EditQuestionBankFormData } from "@/src/types";
import { type QuestionBank, BankVisibility } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { questionBankFormSchema } from "@/src/schemas/question-bank-form.schema";
import { updateBankAction } from "@/src/lib/actions/bank.actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import BankEditHeader from "./BankEditHeader";
import BankEditPreviewCard from "./BankEditPreviewCard";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";

const editFormId = "question-bank-edit-form";

function toInitialFormData(bank: QuestionBank): EditQuestionBankFormData {
  return {
    name: bank.name,
    description: bank.description || "",
    tags: bank.tags ? bank.tags.join(", ") : "",
    visibility: bank.visibility,
    ownerTopicId: "",
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
  topics,
}: {
  bank: QuestionBank;
  topics: Topic[];
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<EditQuestionBankFormData>(() => toInitialFormData(bank));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();

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
    
    startTransition(async () => {
      const res = await updateBankAction(bank.id, {
        name: formData.name,
        description: formData.description,
        tags: normalizeTags(formData.tags),
        visibility: formData.visibility,
      });

      if (!res.success) {
        setValidationErrors([res.error || "Failed to update bank"]);
      } else {
        router.push("/banks");
      }
    });
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <BankEditHeader formId={editFormId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
          <CardDescription>
            Update the title, summary, visibility, and tags to keep this bank easy to understand and discover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="bank-name" className="block text-sm font-semibold text-primary">
                  Bank name *
                </Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="e.g. Mathematics - Grade 11"
                  value={formData.name}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, name: event.target.value }));
                    setValidationErrors([]);
                  }}
                  required
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-2">
                  <Label htmlFor="bank-description" className="block text-sm font-semibold text-primary">
                    Description
                  </Label>
                  <Textarea
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

                <div className="space-y-2 lg:col-start-2">
                  <Label htmlFor="bank-owner-topic" className="block text-sm font-semibold text-primary">
                    Owner Topic
                  </Label>
                  <Select
                    id="bank-owner-topic"
                    value={formData.ownerTopicId}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, ownerTopicId: event.target.value }));
                      setValidationErrors([]);
                    }}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                  >
                    <option value="">Select a topic owner</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-inkd">
                    Assign the primary topic owner for this bank.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-visibility" className="block text-sm font-semibold text-primary">
                    Visibility
                  </Label>
                  <Select
                    id="bank-visibility"
                    value={formData.visibility}
                    onChange={(event) => {
                      setFormData((current) => ({
                        ...current,
                        visibility: event.target.value as EditQuestionBankFormData["visibility"],
                      }));
                      setValidationErrors([]);
                    }}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                  >
                    <option value="PRIVATE">Private</option>
                    <option value="SHARED">Shared</option>
                    <option value="PUBLIC">Public</option>
                  </Select>
                  <p className="text-xs text-inkd">
                    Choose who can discover and reuse this bank once changes are saved.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-tags" className="block text-sm font-semibold text-primary">
                  Tags
                </Label>
                <Input
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
