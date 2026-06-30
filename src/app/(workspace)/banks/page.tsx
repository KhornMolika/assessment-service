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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { useTopicStore } from "@/src/stores/topic-store";
import { useSearchParams } from "next/navigation";

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

export function BanksPageContent({ isEmbed = false }: { isEmbed?: boolean }) {
  const searchParams = useSearchParams();
  const query = getSingleSearchParam(searchParams.get("query"));
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);

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
    <div className={isEmbed ? "" : "space-y-6"}>
      {!isEmbed && <BanksHeader bankCount={banks.length} totalQuestions={totalQuestions} />}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>
              Bank library {activeTopic ? `(${activeTopic.name})` : ""}
            </CardTitle>
            <CardDescription>
              Search, scan metadata, and jump into bank-specific authoring
              workflows.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <BanksCatalogToolbar />
          <div>
            {filteredBanks.length === 0 ? (
              <StateMessage
                title={
                  hasActiveFilters ? "No banks found" : "No banks available"
                }
                description={
                  hasActiveFilters
                    ? "No question banks match the current search or topic filter."
                    : "Question banks will appear here once they are added."
                }
                action={
                  hasActiveFilters ? (
                    <Link
                      href="/banks"
                      className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      Clear filters
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
