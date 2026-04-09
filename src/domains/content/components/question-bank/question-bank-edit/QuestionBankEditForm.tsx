"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bank, EditQuestionBankFormData } from "@/src/domains/content/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import QuestionBankEditHeader from "./QuestionBankEditHeader";
import QuestionBankEditPreviewCard from "./QuestionBankEditPreviewCard";

const editFormId = "question-bank-edit-form";

function toInitialFormData(bank: Bank): EditQuestionBankFormData {
  return {
    name: bank.name,
    description: bank.description,
    tags: bank.tags.join(", "),
    visibility: bank.visibility,
  };
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function QuestionBankEditForm({ bank }: { bank: Bank }) {
  const router = useRouter();
  const [formData, setFormData] = useState<EditQuestionBankFormData>(() => toInitialFormData(bank));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Updating bank:", {
      id: bank.id,
      ...formData,
      tags: normalizeTags(formData.tags),
    });

    router.push("/banks");
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <QuestionBankEditHeader formId={editFormId} />

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
              <div className="space-y-2">
                <label htmlFor="bank-name" className="block text-sm font-semibold text-primary">
                  Bank name *
                </label>
                <input
                  id="bank-name"
                  type="text"
                  placeholder="e.g. Mathematics - Grade 11"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
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
                    onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bank-visibility" className="block text-sm font-semibold text-primary">
                    Visibility
                  </label>
                  <select
                    id="bank-visibility"
                    value={formData.visibility}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        visibility: event.target.value as EditQuestionBankFormData["visibility"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                  >
                    <option value="PRIVATE">Private</option>
                    <option value="ORG">Organization</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                  <p className="text-xs text-inkd">
                    Choose who can discover and reuse this bank once changes are saved.
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
                  onChange={(event) => setFormData((current) => ({ ...current, tags: event.target.value }))}
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
          <QuestionBankEditPreviewCard bank={bank} formData={formData} />
        </div>
      </div>
    </div>
  );
}
