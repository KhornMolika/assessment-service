"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { QuestionBank } from "@/src/types/api";
import type { BankTopicMap } from "@/src/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  bankMatchesTopic,
} from "@/src/utils/topic-utils";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import BankTableInteractive from "./BankTableInteractive";
import BanksHeader from "./BanksHeader";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

export default function BanksCatalog({
  banks,
  bankTopics,
}: {
  banks: QuestionBank[];
  bankTopics: BankTopicMap[];
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({
    key: "query",
  });
  const [bankItems, setBankItems] = useState(banks);
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const topicFilter = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  const filteredBanks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return bankItems.filter((bank) => {
      if (
        topicFilter !== ALL_TOPICS_VALUE &&
        !bankMatchesTopic(bank.id, topicFilter, bankTopics)
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystacks = [bank.name, bank.description || "", bank.visibility, ...(bank.tags || [])];

      return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [bankItems, bankTopics, searchQuery, topicFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBanks.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedBanks = filteredBanks.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const totalQuestions = useMemo(
    () => bankItems.reduce((sum, bank) => sum + (bank.questionCount || 0), 0),
    [bankItems],
  );

  const handlePageSizeChange = (size: number) => {
    updateUrl({
      pageSize: size === 6 ? null : size,
      page: null,
    });
  };

  const handleDeleteBank = (bankId: string) => {
    setBankItems((current) => current.filter((bank) => bank.id !== bankId));
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || topicFilter !== ALL_TOPICS_VALUE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <BanksHeader bankCount={bankItems.length} totalQuestions={totalQuestions} />

      <PaginatedCollectionCard
        title="Bank library"
        description="Search, scan metadata, and jump into bank-specific authoring workflows."
        className="overflow-hidden"
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
              <Input
                type="text"
                placeholder="Search banks"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>
          </div>
        }
        isEmpty={filteredBanks.length === 0}
        emptyState={
          <StateMessage
            title={hasActiveFilters ? "No banks found" : "No banks available"}
            description={
              hasActiveFilters
                ? "No question banks match the current search or topic filter."
                : "Question banks will appear here once they are added to the workspace."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateUrl({
                      page: null,
                      query: null,
                      topic: null,
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        }
        pagination={{
          currentPage: activePage,
          totalPages,
          pageSize: itemsPerPage,
          totalItems: filteredBanks.length,
          pageSizeOptions: [5, 10, 20, 50],
          itemLabel: "banks",
          onPageChange: (page) => updateUrl({ page: page === 1 ? null : page }),
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        <BankTableInteractive banks={paginatedBanks} onDelete={handleDeleteBank} />
      </PaginatedCollectionCard>
    </div>
  );
}
