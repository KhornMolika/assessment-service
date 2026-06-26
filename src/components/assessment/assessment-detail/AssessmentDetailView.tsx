"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import type { AssessmentDetailPageData } from "@/src/types/assessment-detail.types";

import AssessmentDetailInformationCard from "./AssessmentDetailInformationCard";
import AssessmentQuestionsCard from "./AssessmentQuestionsCard";
import AssessmentDetailHeader from "./AssessmentDetailHeader";

export default function AssessmentDetailView({
  data,
  editBlocked,
}: {
  data: AssessmentDetailPageData;
  editBlocked?: boolean;
}) {
  const { assessment, questions } = data;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (editBlocked) {
      toast.error("An archived assessment cannot be edited anymore.", {
        id: "edit-blocked-toast",
      });
      // Clean up the URL to remove the query parameter
      router.replace(pathname, { scroll: false });
    }
  }, [editBlocked, pathname, router]);

  return (
    <div className="space-y-6">
      <AssessmentDetailHeader assessment={assessment} />

      <div className="w-full space-y-6">
        <AssessmentDetailInformationCard assessment={assessment} />
        
        <AssessmentQuestionsCard
          assessment={assessment}
          questions={questions}
          totalQuestions={
            assessment.settings?.numQuestions ?? 0
          }
        />
      </div>
    </div>
  );
}
