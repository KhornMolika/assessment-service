import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getMockBankTopics, getMockBanks } from "@/src/components/content/api/content.api";
import BanksCatalogToolbar from "@/src/components/content/components/bank/catalog/BanksCatalogToolbar";
import BankGridInteractive from "@/src/components/content/components/bank/catalog/BankGridInteractive";
import BanksHeader from "@/src/components/content/components/bank/catalog/BanksHeader";
import type { Bank } from "@/src/types/bank.types";
import type { BankTopicMap } from "@/src/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  bankMatchesTopic,
} from "@/src/components/content/utils/topic-utils";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import LinkPagination from "@/src/components/ui/navigation/LinkPagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";

export const metadata: Metadata = {
  title: "Question Banks",
};

type BankSearchParams = Promise<{
  topic?: string | string[];
  query?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
}>;

function getSingleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function filterBanks({
  banks,
  bankTopics,
  topicFilter,
  query,
}: {
  banks: Bank[];
  bankTopics: BankTopicMap[];
  topicFilter: string;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return banks.filter((bank) => {
    if (
      topicFilter !== ALL_TOPICS_VALUE &&
      !bankMatchesTopic(bank.id, topicFilter, bankTopics)
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystacks = [bank.name, bank.description, bank.visibility, ...bank.tags];

    return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

async function BanksPageContent({ searchParams }: { searchParams: BankSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const topicFilter =
    getSingleSearchParam(resolvedSearchParams.topic, ALL_TOPICS_VALUE) ||
    ALL_TOPICS_VALUE;
  const query = getSingleSearchParam(resolvedSearchParams.query);
  const currentPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams.page),
    1,
  );
  const itemsPerPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams.pageSize),
    6,
  );
  const [banks, bankTopics] = await Promise.all([getMockBanks(), getMockBankTopics()]);
  const filteredBanks = filterBanks({ banks, bankTopics, topicFilter, query });
  const totalPages = Math.max(1, Math.ceil(filteredBanks.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedBanks = filteredBanks.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  const totalQuestions = banks.reduce((sum, bank) => sum + bank.question_count, 0);
  const hasActiveFilters = query.trim().length > 0 || topicFilter !== ALL_TOPICS_VALUE;

  return (
    <div className="space-y-6 px-4 py-4">
      <BanksHeader bankCount={banks.length} totalQuestions={totalQuestions} />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Bank library</CardTitle>
            <CardDescription>
              Search, scan metadata, and jump into bank-specific authoring workflows.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <BanksCatalogToolbar />
          <div>
            {filteredBanks.length === 0 ? (
              <StateMessage
                title={hasActiveFilters ? "No banks found" : "No banks available"}
                description={
                  hasActiveFilters
                    ? "No question banks match the current search or topic filter."
                    : "Question banks will appear here once they are added to the workspace."
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
              <BankGridInteractive banks={paginatedBanks} />
            )}
          </div>
        </CardContent>

        {filteredBanks.length > 0 ? (
          <LinkPagination
            pathname="/banks"
            searchParams={{
              topic: topicFilter === ALL_TOPICS_VALUE ? null : topicFilter,
              query: query || null,
              pageSize: itemsPerPage === 6 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={6}
            totalItems={filteredBanks.length}
            pageSizeOptions={[6, 9, 12, 24]}
            itemLabel="banks"
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function BanksPage({ searchParams }: { searchParams: BankSearchParams }) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <BanksPageContent searchParams={searchParams} />
    </Suspense>
  );
}
