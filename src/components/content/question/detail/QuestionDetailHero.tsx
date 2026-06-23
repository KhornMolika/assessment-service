import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import type { ApiQuestionResponse } from "@/src/types/question-detail.types";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";
import DeleteQuestionModal from "./DeleteQuestionModal";

export default function QuestionDetailHero({
  question,
}: {
  question: ApiQuestionResponse;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <PageHeaderCard
        backHref="/questions"
        title="Question Details"
        actions={
          <div className="relative" ref={menuRef}>
            <Button
              onClick={() => setShowMenu(!showMenu)}
              variant="ghost"
              className="flex h-10 w-10 items-center justify-center rounded-full p-0 text-primary transition hover:bg-muted/50"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-6 w-6" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <Link
                  href={`/questions/${question.id}/edit`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                >
                  <Edit className="h-4 w-4" /> Edit
                </Link>
                <Link
                  href={`/questions/${question.id}/duplicate`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        }
      />

      <DeleteQuestionModal
        open={showDeleteModal}
        question={question as any}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
