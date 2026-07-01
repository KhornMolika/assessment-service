"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { fetchTopicBanks, fetchGlobalBanks } from "@/src/actions/bank-actions";
import BanksCatalogToolbar from "@/src/components/content/bank/catalog/BanksCatalogToolbar";
import BankTableInteractive from "@/src/components/content/bank/catalog/BankTableInteractive";
import BanksHeader from "@/src/components/content/bank/catalog/BanksHeader";
import type { QuestionBank } from "@/src/types/api";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import Pagination from "@/src/components/ui/navigation/Pagination";
import { Plus } from "lucide-react";
import { TopicSelector } from "@/src/components/topic-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { useTopicStore } from "@/src/stores/topic-store";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function getSingleSearchParam(
  value: string | string[] | null | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function parsePositiveInteger(
  value: string | null | undefined,
  fallback: number,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function filterBanks({
  banks,
  query,
}: {
  banks: QuestionBank[];
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return banks.filter((bank) => {
    if (!normalizedQuery) return true;
    const haystacks = [
      bank.name,
      bank.description || "",
      bank.visibility,
      ...(bank.tags || []),
    ];
    return haystacks.some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });
}

export function BanksPageContent() {
  const searchParams = useSearchParams();
  const query = getSingleSearchParam(searchParams.get("query"));
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const t = useTranslations("Banks");

  const activeTopic = useTopicStore((s) => s.activeTopic);

  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchResources() {
      setIsLoading(true);
      try {
        let fetchedBanks;
        if (activeTopic === null) {
          fetchedBanks = await fetchGlobalBanks();
        } else {
          fetchedBanks = await fetchTopicBanks(activeTopic.id);
        }

        if (isMounted) {
          setBanks(fetchedBanks);
        }
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchResources();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic?.id ?? "all"]);

  if (isLoading) {
    return <WorkspacePageSkeleton />;
  }

  const filteredBanks = filterBanks({ banks, query });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBanks.length / itemsPerPage),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedBanks = filteredBanks.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  // simplified total questions count
  const totalQuestions = banks.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum, bank: any) => sum + (bank.questionCount || 0),
    0,
  );
  const hasActiveFilters = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <BanksHeader bankCount={banks.length} totalQuestions={totalQuestions} />

      <Card className="overflow-hidden embed-transparent-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>
              {t("bankLibrary")} {activeTopic ? `(${activeTopic.name})` : ""}
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {t("bankLibraryDesc")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TopicSelector className="embed-only-element" />
            <Link
              href="/banks/new"
              className="embed-only-element inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("newBank")}</span>
              <span className="sm:hidden">{t("new")}</span>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <BanksCatalogToolbar />
          <div>
            {filteredBanks.length === 0 ? (
              <StateMessage
                title={
                  hasActiveFilters ? t("noBanksTitle") : t("noBanksAvailTitle")
                }
                description={
                  hasActiveFilters
                    ? t("noBanksDesc")
                    : t("noBanksAvailDesc")
                }
                action={
                  hasActiveFilters ? (
                    <Link
                      href="/banks"
                      className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      {t("clearFilters")}
                    </Link>
                  ) : null
                }
              />
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <BankTableInteractive banks={paginatedBanks as any} />
            )}
          </div>
        </CardContent>

        {filteredBanks.length > 0 ? (
          <Pagination
            pathname="/banks"
            searchParams={{
              query: query || null,
              pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={10}
            totalItems={filteredBanks.length}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="banks"
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function BanksPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BanksPageContent />
    </Suspense>
  );
}
