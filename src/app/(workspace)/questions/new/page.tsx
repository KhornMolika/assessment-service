import { Suspense } from "react";
import QuestionNewForm from "@/src/components/content/question/new/QuestionNewForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export default function CreateNewQuestionPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionNewForm />
    </Suspense>
  );
}
