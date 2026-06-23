"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Copy, Edit, Eye, Globe, Lock, Users, Trash2 } from "lucide-react";
import type { QuestionBank } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import DeleteBankModal from "@/src/components/content/bank/DeleteBankModal";

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

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function BankTableInteractive({
  banks,
  onDelete,
}: {
  banks: QuestionBank[];
  onDelete?: (id: string) => void;
}) {
  const [items, setItems] = useState(banks);
  const [bankPendingDelete, setBankPendingDelete] = useState<QuestionBank | null>(null);

  useEffect(() => {
    setItems(banks);
  }, [banks]);

  const handleDeleteBank = (bankId: string) => {
    setItems((current) => current.filter((bank) => bank.id !== bankId));
    setBankPendingDelete(null);
    onDelete?.(bankId);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 min-w-[200px]">Bank Name</TableHead>
            <TableHead className="text-center min-w-[100px]">Questions</TableHead>
            <TableHead className="min-w-[120px]">Visibility</TableHead>
            <TableHead className="min-w-[120px]">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((bank) => {
            return (
              <TableRow key={bank.id}>
                <TableCell>
                  <div className="max-w-xl overflow-hidden">
                    <Link
                      href={`/banks/${bank.id}`}
                      className="block truncate font-medium text-primary transition hover:text-pm hover:underline"
                    >
                      {bank.name}
                    </Link>
                    {bank.tags && bank.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {bank.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${bank.id}-${tag}`}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-inkd"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">
                  {bank.questionCount || 0}
                </TableCell>
                <TableCell>
                  <Badge variant={getVisibilityBadgeVariant(bank.visibility)}>
                    {renderVisibilityIcon(bank.visibility)}
                    {bank.visibility.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-inkd">
                  {formatDate(bank.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/banks/${bank.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                      title="View bank"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/banks/${bank.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="Edit bank"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/banks/${bank.id}/duplicate`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Duplicate bank"
                    >
                      <Copy className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBankPendingDelete(bank)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete bank"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {bankPendingDelete && (
        <DeleteBankModal
          open={true}
          bank={bankPendingDelete}
          onClose={() => setBankPendingDelete(null)}
          onConfirm={() => handleDeleteBank(bankPendingDelete.id)}
        />
      )}
    </>
  );
}
