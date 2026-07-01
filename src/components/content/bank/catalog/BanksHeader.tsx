"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";
import { IntegrationModal } from "@/src/components/ui/modals/IntegrationModal";
import { useTranslations } from "next-intl";

export default function BanksHeader({
  bankCount,
  totalQuestions,
}: {
  bankCount: number;
  totalQuestions: number;
}) {
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const t = useTranslations("Banks");

  return (
    <>
      <PageHeaderCard
        className="catalog-header"
        title={t("title")}
        description={t("description", { bankCount, totalQuestions })}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              onClick={() => setIntegrationOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
            >
              <Copy className="h-4 w-4" />
              {t("integrateBtn")}
            </Button>
            <Link
              href="/banks/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-60"
            >
              <Plus className="h-4 w-4" />
              {t("newBank")}
            </Link>
          </div>
        }
      />

      <IntegrationModal
        open={integrationOpen}
        onClose={() => setIntegrationOpen(false)}
        componentName={t("title")}
        componentExport="BanksCatalog"
        description={t("integrateDesc")}
        embedPath="/banks"
      />
    </>
  );
}
