import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MoreHorizontal, Edit, Copy, Trash2, ListChecks } from "lucide-react";
import type { QuestionBank } from "@/src/types/api";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function BankDetailHeader({
  bank,
  onDelete,
}: {
  bank: QuestionBank;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
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
        backHref="/banks"
        title="Question Bank Details"
        description={bank.description || ""}
        actions={
          <div className="flex shrink-0 items-center gap-3">
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
                    href={`/banks/${bank.id}/edit`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                  >
                    <Edit className="h-4 w-4" /> Edit Bank
                  </Link>
                  <Link
                    href={`/banks/${bank.id}/duplicate`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <Copy className="h-4 w-4" /> Duplicate
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
