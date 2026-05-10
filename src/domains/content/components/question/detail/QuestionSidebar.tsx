"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Globe, Trash2 } from "lucide-react";
import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import { getDifficultyColor } from "./QuestionDetailHero";
import DeleteQuestionModal from "./DeleteQuestionModal";

function getLanguageName(code: string) {
  return code === "EN" ? "English" : code === "KH" ? "Khmer" : code;
}

export default function QuestionSidebar({
  question,
  onDuplicate,
}: {
  question: QuestionDetailData;
  onDuplicate: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/questions/${question.id}/edit`}
              className="flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-pm"
            >
              Edit Question
            </Link>
            <button
              onClick={onDuplicate}
              className="min-h-12 w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Duplicate
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />Delete
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Question Bank</div>
              {question.bank ? (
                <Link href="/banks" className="flex items-start gap-1 font-semibold text-pm hover:underline">
                  <span className="min-w-0 flex-1">{question.bank.name}</span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
                </Link>
              ) : (
                <div className="font-semibold text-primary">No bank assigned</div>
              )}
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Question Type</div>
              <div className="font-semibold text-primary">{question.type.name}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Language</div>
              <div className="flex items-center gap-2 text-primary">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{getLanguageName(question.language)}</span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Difficulty</div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Points</div>
              <div className="text-lg font-bold text-primary">{question.points}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-1 text-xs text-inkd">Created By</div>
              <div className="font-semibold text-primary">{question.stats.createdBy}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 md:col-span-2 xl:col-span-1">
              <div className="mb-1 text-xs text-inkd">Created At</div>
              <div className="break-words font-semibold text-primary">{new Date(question.created_at).toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 md:col-span-2 xl:col-span-2">
              <div className="mb-2 text-xs text-inkd">Topics</div>
              <div className="flex flex-wrap gap-2">
                {question.topics.map((topic) => (
                  <span key={topic.id} className="rounded-full bg-accp px-3 py-1 text-xs font-semibold text-pl">
                    {topic.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 md:col-span-2 xl:col-span-3">
              <div className="mb-2 text-xs text-inkd">Tags</div>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-2 py-1 text-xs font-medium text-inkd">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteQuestionModal open={showDeleteModal} question={question} onClose={() => setShowDeleteModal(false)} />
    </>
  );
}
