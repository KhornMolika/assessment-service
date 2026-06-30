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
import { ActionMenu } from "@/src/components/ui/ui/action-menu";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Banks");
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
            <TableHead className="w-1/3 min-w-50">{t("bankName")}</TableHead>
            <TableHead className="text-center min-w-25">{t("questions")}</TableHead>
            <TableHead className="min-w-30">{t("visibility")}</TableHead>
            <TableHead className="min-w-30">{t("created")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
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
                  <ActionMenu>
                    <Link
                      href={`/banks/${bank.id}`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" /> {t("view")}
                    </Link>
                    <Link
                      href={`/banks/${bank.id}/edit`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Edit className="h-4 w-4" /> {t("edit")}
                    </Link>
                    <Link
                      href={`/banks/${bank.id}/duplicate`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-primary transition hover:bg-primary/5"
                    >
                      <Copy className="h-4 w-4" /> {t("duplicate")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBankPendingDelete(bank)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> {t("delete")}
                    </button>
                  </ActionMenu>
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
