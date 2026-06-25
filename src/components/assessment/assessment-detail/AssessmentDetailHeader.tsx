"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Edit, MoreHorizontal, Trash2, Globe, Archive } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AssessmentDetailRecord } from "@/src/types/assessment-detail.types";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";
import { deleteAssessmentAction, publishAssessmentAction, archiveAssessmentAction } from "@/src/lib/actions/assessment.actions";

export default function AssessmentDetailHeader({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      try {
        const res = await deleteAssessmentAction(assessment.id);
        if (res.success) {
          toast.success("Assessment deleted successfully");
          router.refresh();          router.push("/assessments");
        } else {
          toast.error(res.error || "Failed to delete assessment");
        }
      } catch (e: any) {
        toast.error(e.message || "An unexpected error occurred");
      }
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      try {
        const res = await publishAssessmentAction(assessment.id);
        if (res.success) {
          toast.success("Assessment published successfully");
        } else {
          toast.error(res.error || "Failed to publish assessment");
        }
      } catch (e: any) {
        toast.error(e.message || "An unexpected error occurred");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        const res = await archiveAssessmentAction(assessment.id);
        if (res.success) {
          toast.success("Assessment archived successfully");
        } else {
          toast.error(res.error || "Failed to archive assessment");
        }
      } catch (e: any) {
        toast.error(e.message || "An unexpected error occurred");
      }
    });
  };

  const actualTitle = assessment.name || assessment.title || "Untitled";

  return (
    <section>
      <div>
        <PageHeaderCard
          backHref="/assessments"
          title="Assessment Details"
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
                    href={`/assessments/${assessment.id}/edit`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                  <Link
                    href={`/assessments/${assessment.id}/duplicate`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <Copy className="h-4 w-4" /> Duplicate
                  </Link>
                  {assessment.lifecycle === "DRAFT" && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handlePublish();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Globe className="h-4 w-4" /> Publish
                    </button>
                  )}
                  {assessment.lifecycle === "PUBLISHED" && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleArchive();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-amber-600 transition hover:bg-amber-50"
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  )}
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
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assessment"
        entityName={actualTitle}
        description="Are you sure you want to delete this assessment? This action removes it from the catalog and cannot be undone."
        isPending={isPending}
      />
    </section>
  );
}
