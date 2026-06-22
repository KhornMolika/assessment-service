"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Calendar, Copy, Edit, Eye, Globe, Lock, Trash2, Users } from "lucide-react";
import DeleteBankModal from "@/src/components/content/bank/DeleteBankModal";
import type { QuestionBank } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Button } from "@/src/components/ui/ui/button";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityBadgeVariant(visibility: QuestionBank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return "success" as const;
    case "SHARED":
      return "info" as const;
    default:
      return "secondary" as const;
  }
}

function renderVisibilityIcon(visibility: QuestionBank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return <Globe className="mr-1 h-3.5 w-3.5" />;
    case "SHARED":
      return <Users className="mr-1 h-3.5 w-3.5" />;
    default:
      return <Lock className="mr-1 h-3.5 w-3.5" />;
  }
}

export default function BankCard({
  bank,
  onDelete,
}: {
  bank: QuestionBank;
  onDelete?: (bankId: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="transition hover:border-primary hover:shadow-md">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <Link href={`/banks/${bank.id}`} className="block">
              <CardTitle className="transition hover:text-pm">{bank.name}</CardTitle>
            </Link>
            <CardDescription className="line-clamp-2">{bank.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {bank.questionCount || 0} questions
            </Badge>
            <Badge variant={getVisibilityBadgeVariant(bank.visibility)}>
              {renderVisibilityIcon(bank.visibility)}
              {bank.visibility.toLowerCase()}
            </Badge>
          </div>

          {(bank.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(bank.tags || []).slice(0, 4).map((tag) => (
                <span
                  key={`${bank.id}-${tag}`}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-inkd"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-inkd">
            <Calendar className="h-4 w-4" />
            Created {formatDate(bank.createdAt)}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Link
              href={`/banks/${bank.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-blue-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye className="h-5 w-5" />
              View
            </Link>
            <Link
              href={`/banks/${bank.id}/edit`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-emerald-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Edit className="h-5 w-5" />
              Edit
            </Link>
            <Button
              type="button"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg border border-border text-indigo-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              aria-label={`Duplicate ${bank.name}`} variant="ghost"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              className="h-9 w-9 shrink-0 rounded-lg border border-red-200 text-red-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${bank.name}`} variant="ghost"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteBankModal
        open={deleteOpen}
        bank={bank}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete?.(bank.id);
        }}
      />
    </>
  );
}
