"use client";

import type { QuestionCatalogItem } from "@/src/domains/content/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

function getTypeVariant(type: QuestionCatalogItem["type"]) {
  switch (type) {
    case "MCQ":
    case "Multiple Choice":
      return "info" as const;
    case "True/False":
      return "success" as const;
    case "Short Answer":
      return "secondary" as const;
    case "Long Essay":
      return "pending" as const;
    case "Rating":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function getDifficultyVariant(difficulty: QuestionCatalogItem["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "success" as const;
    case "Medium":
      return "warning" as const;
    default:
      return "pending" as const;
  }
}

export default function QuestionBankRecentQuestions({
  bankName,
  questions,
}: {
  bankName: string;
  questions: QuestionCatalogItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent questions</CardTitle>
        <CardDescription>
          A sample of the content that currently lives inside this bank.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-inkd">
            No questions have been added to {bankName} yet.
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-border p-4 transition hover:border-gray-300"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={getTypeVariant(question.type)}>{question.type}</Badge>
                <Badge variant={getDifficultyVariant(question.difficulty)}>{question.difficulty}</Badge>
                <span className="text-xs font-medium text-inkd">{question.points} pts</span>
              </div>
              <p className="font-medium text-primary">{question.text}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
