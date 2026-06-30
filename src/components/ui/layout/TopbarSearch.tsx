"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, FileText, Database, HelpCircle, Loader2 } from "lucide-react";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import { useTranslations } from "next-intl";
import { globalSearch, GlobalSearchResult } from "@/src/api/search.api";
import Link from "next/link";

export function TopbarSearch() {
  const t = useTranslations("Topbar");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => {
          if (open) {
            setInputValue("");
            setResults(null);
          }
          return !open;
        });
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setInputValue("");
        setResults(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmedValue = inputValue.trim();
      if (!trimmedValue) {
        setResults(null);
        return;
      }
      startTransition(async () => {
        const res = await globalSearch(trimmedValue, ALL_TOPICS_VALUE);
        setResults(res);
      });
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [inputValue]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card py-2.5 pl-4 pr-3 text-sm text-inkd transition hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-pm"
        aria-label={t("searchPlaceholder")}
      >
        <Search className="h-4 w-4 text-inkl" />
        <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-inkd sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-[10vh] px-4 backdrop-blur-sm transition-all"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl flex flex-col overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Search className="h-5 w-5 text-pm" />
              <input
                autoFocus
                type="search"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent text-lg text-primary placeholder:text-inkl focus:outline-none"
              />
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-inkd" />}
              <kbd className="hidden rounded bg-muted px-2 py-1 text-xs font-medium text-inkd sm:inline-block">
                ESC
              </kbd>
            </div>
            
            {!inputValue.trim() && (
              <div className="bg-muted/30 px-4 py-3 text-xs text-inkd">
                {t("searchHint")}
              </div>
            )}
            
            {inputValue.trim() && (
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!results && isPending ? (
                  <div className="p-10 text-center text-sm text-inkd flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
                    <span>Searching workspace...</span>
                  </div>
                ) : results && (
                  <div className="flex flex-col gap-4">
                    {/* Assessments */}
                    {results.assessments.length > 0 && (
                      <div className="px-2">
                        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-primary/70">
                          <FileText className="h-3.5 w-3.5" />
                          Assessments
                        </div>
                        <div className="flex flex-col gap-1">
                          {results.assessments.map(item => (
                            <Link 
                              key={item.id} 
                              href={`/assessments/${item.id}`} 
                              onClick={() => setIsOpen(false)}
                              className="group flex flex-col rounded-xl px-4 py-2.5 transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                            >
                              <span className="text-sm font-semibold text-primary group-hover:text-pm transition-colors">{item.name}</span>
                              {item.description && <span className="mt-0.5 truncate text-xs text-inkd">{item.description}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Question Banks */}
                    {results.banks.length > 0 && (
                      <div className="px-2">
                        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-primary/70">
                          <Database className="h-3.5 w-3.5" />
                          Question Banks
                        </div>
                        <div className="flex flex-col gap-1">
                          {results.banks.map(item => (
                            <Link 
                              key={item.id} 
                              href={`/question-banks/${item.id}`} 
                              onClick={() => setIsOpen(false)}
                              className="group flex flex-col rounded-xl px-4 py-2.5 transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                            >
                              <span className="text-sm font-semibold text-primary group-hover:text-pm transition-colors">{item.name}</span>
                              {item.description && <span className="mt-0.5 truncate text-xs text-inkd">{item.description}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Questions */}
                    {results.questions.length > 0 && (
                      <div className="px-2">
                        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-primary/70">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Questions
                        </div>
                        <div className="flex flex-col gap-1">
                          {results.questions.map(item => (
                            <Link 
                              key={item.id} 
                              href={`/questions?search=${encodeURIComponent(item.questionText)}`}
                              onClick={() => setIsOpen(false)}
                              className="group flex flex-col rounded-xl px-4 py-2.5 transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                            >
                              <span className="truncate text-sm font-semibold text-primary group-hover:text-pm transition-colors">{item.questionText}</span>
                              <span className="mt-0.5 truncate text-xs text-inkd uppercase tracking-wider">
                                {item.type.replace(/_/g, ' ')} {item.bankName ? `• ${item.bankName}` : ''}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.assessments.length === 0 && results.banks.length === 0 && results.questions.length === 0 && (
                      <div className="p-12 text-center text-sm text-inkd">
                        No results found for <span className="font-semibold">&quot;{inputValue}&quot;</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
