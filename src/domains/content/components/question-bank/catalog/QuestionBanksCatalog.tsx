"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Bank } from "@/src/domains/content/types/bank.types";
import type { BankTopicMap } from "@/src/domains/content/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  bankMatchesTopic,
} from "@/src/domains/content/utils/topic-utils";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/shared/hooks/use-url-query-state";
import Pagination from "@/src/shared/components/navigation/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import QuestionBankCard from "./QuestionBankCard";
import QuestionBanksHeader from "./QuestionBanksHeader";
import QuestionBanksStats from "./QuestionBanksStats";

export default function QuestionBanksCatalog({
  banks,
  bankTopics,
}: {
  banks: Bank[];
  bankTopics: BankTopicMap[];
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({
    key: "query",
  });
  const [bankItems, setBankItems] = useState(banks);
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 6);
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

      const haystacks = [bank.name, bank.description, bank.visibility, ...bank.tags];

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
    () => bankItems.reduce((sum, bank) => sum + bank.question_count, 0),
    [bankItems],
  );

  const largestBank = useMemo(() => {
    return bankItems.reduce<Bank | undefined>((largest, bank) => {
      if (!largest || bank.question_count > largest.question_count) {
        return bank;
      }

      return largest;
    }, undefined);
  }, [bankItems]);

  const publicBankCount = useMemo(
    () => bankItems.filter((bank) => bank.visibility === "PUBLIC").length,
    [bankItems],
  );

  const recentlyCreatedCount = useMemo(() => {
    const now = new Date();

    return bankItems.filter((bank) => {
      const createdAt = new Date(bank.created_at);
      const diffInDays = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffInDays <= 31;
    }).length;
  }, [bankItems]);

  const handlePageSizeChange = (size: number) => {
    updateUrl({
      pageSize: size === 6 ? null : size,
      page: null,
    });
  };

  const handleDeleteBank = (bankId: string) => {
    setBankItems((current) => current.filter((bank) => bank.id !== bankId));
  };

  return (
    <div className="space-y-6 px-4 py-4">
      <QuestionBanksHeader bankCount={bankItems.length} totalQuestions={totalQuestions} />

      <QuestionBanksStats
        largestBank={largestBank}
        publicBankCount={publicBankCount}
        recentlyCreatedCount={recentlyCreatedCount}
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Bank library</CardTitle>
          <CardDescription>
            Search, scan metadata, and jump into bank-specific authoring workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
              <input
                type="text"
                placeholder="Search banks"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {paginatedBanks.map((bank) => (
              <QuestionBankCard key={bank.id} bank={bank} onDelete={handleDeleteBank} />
            ))}
          </div>

          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            totalItems={filteredBanks.length}
            pageSizeOptions={[6, 9, 12, 24]}
            itemLabel="banks"
            onPageChange={(page) => updateUrl({ page: page === 1 ? null : page })}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
