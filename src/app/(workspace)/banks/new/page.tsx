"use client";

import { Suspense } from "react";
import BankNewForm from "@/src/components/content/bank/new/BankNewForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export default function NewBanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BankNewForm />
    </Suspense>
  );
}
