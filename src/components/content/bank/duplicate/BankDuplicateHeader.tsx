import Link from "next/link";
import { Save } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function BankDuplicateHeader({ 
  formId, 
  disabled = false, 
  isPending = false 
}: { 
  formId: string;
  disabled?: boolean;
  isPending?: boolean;
}) {
  return (
    <PageHeaderCard
      backHref="/banks"
      title="Duplicate Question Bank"
      description="Create a new bank starting with the same details as the original."
      actions={
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/banks"
            className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-muted"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            form={formId}
            disabled={disabled || isPending}
            className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Save className="h-4 w-4" />
            {isPending ? "Duplicating..." : "Duplicate Bank"}
          </Button>
        </div>
      }
    />
  );
}
