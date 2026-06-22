"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Edit3, Eye, Plus, Save, Search, Tags, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Topic } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import { Modal } from "@/src/components/ui/ui/modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import { createTopicAction, updateTopicAction, deleteTopicAction } from "@/src/lib/actions/topic.actions";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";
import Pagination from "@/src/components/ui/navigation/Pagination";

type TopicUsage = {
  banks: number;
  questions: number;
  assessments: number;
};

type EditableTopic = Topic & {
  usage: TopicUsage;
};

type TopicFormState = {
  name: string;
  description: string;
};

const emptyForm: TopicFormState = {
  name: "",
  description: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getUsageTotal(usage: TopicUsage) {
  return usage.banks + usage.questions + usage.assessments;
}

export default function TopicsManager({
  topics,
  totalTopics,
  currentPage,
  itemsPerPage,
  currentSearch,
}: {
  topics: EditableTopic[];
  totalTopics: number;
  currentPage: number;
  itemsPerPage: number;
  currentSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(currentSearch);
  const [form, setForm] = useState<TopicFormState>(emptyForm);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<EditableTopic | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        if (params.has(key)) {
          params.delete(key);
          hasChanges = true;
        }
      } else {
        if (params.get(key) !== String(value)) {
          params.set(key, String(value));
          hasChanges = true;
        }
      }
    }
    if (hasChanges) {
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Debounced search
  useEffect(() => {
    if (query === currentSearch) return; // prevent loop on init
    const timer = setTimeout(() => {
      updateParams({ search: query || null, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const totalPages = Math.ceil(totalTopics / itemsPerPage);
  const paginatedTopics = topics;

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        range.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        range.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return range;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTopicId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.error("Topic name is required.");
      return;
    }
    if (name.length > 255) {
      toast.error("Topic name cannot exceed 255 characters.");
      return;
    }
    if (description.length > 500) {
      toast.error("Description cannot exceed 500 characters.");
      return;
    }

    startTransition(async () => {
      let res;
      if (editingTopicId) {
        res = await updateTopicAction(editingTopicId, { name, description });
      } else {
        res = await createTopicAction({ name, description });
      }

      if (!res.success) {
        toast.error(res.error || "Failed to save topic");
      } else {
        toast.success(editingTopicId ? "Topic updated successfully." : "Topic created successfully.");
        resetForm();
      }
    });
  };

  const handleEdit = (topic: EditableTopic) => {
    setEditingTopicId(topic.id);
    setForm({
      name: topic.name,
      description: topic.description || "",
    });
    // Scroll to the form so the user knows it's active
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (topic: EditableTopic) => {
    const usageTotal = getUsageTotal(topic.usage);

    if (usageTotal > 0) {
      toast.error("Only unused topics can be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the topic "${topic.name}"?`)) return;

    startTransition(async () => {
      const res = await deleteTopicAction(topic.id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete topic");
      } else {
        toast.success("Topic deleted successfully.");
        if (editingTopicId === topic.id) {
          resetForm();
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex h-fit flex-col overflow-hidden lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Topic library</CardTitle>
              <CardDescription>Manage reusable topics to categorize banks, questions, and assessments.</CardDescription>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  placeholder="Search topics..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border-border bg-card pl-9 focus:ring-pm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-semibold text-primary">Topic</TableHead>
                  <TableHead className="hidden font-semibold text-primary sm:table-cell">Usage</TableHead>
                  <TableHead className="font-semibold text-primary">Created</TableHead>
                  <TableHead className="text-right font-semibold text-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTopics.map((topic) => {
                  const usageTotal = getUsageTotal(topic.usage);

                  return (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div className="font-semibold text-primary wrap-break-word line-clamp-2">{topic.name}</div>
                        <div className="mt-1 line-clamp-2 w-100 whitespace-normal wrap-break-word text-sm text-inkd">
                          {topic.description || "No description provided."}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {usageTotal === 0 ? (
                            <Badge variant="secondary" className="text-inkd">-</Badge>
                          ) : (
                            <>
                              <Badge variant="info">{usageTotal} mapped</Badge>
                              {topic.usage.banks > 0 && <Badge variant="secondary">{topic.usage.banks} banks</Badge>}
                              {topic.usage.questions > 0 && <Badge variant="secondary">{topic.usage.questions} questions</Badge>}
                              {topic.usage.assessments > 0 && <Badge variant="secondary">{topic.usage.assessments} assessments</Badge>}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-inkd">
                        {formatDate(topic.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            onClick={() => setPreviewTopic(topic)}
                            size="icon"
                            className="h-8 w-8 rounded text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title={`Preview ${topic.name}`} variant="ghost"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(topic)}
                            disabled={isPending}
                            size="icon"
                            className="h-8 w-8 rounded text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                            title={`Edit ${topic.name}`} variant="ghost"
                          >
                            <Edit3 className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(topic)}
                            disabled={usageTotal > 0 || isPending}
                            size="icon"
                            className="h-8 w-8 rounded text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title={`Delete ${topic.name}`} variant="ghost"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {totalTopics > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={itemsPerPage}
                totalItems={totalTopics}
                pageSizeOptions={[10, 20, 50, 100]}
                itemLabel="topics"
                onPageChange={(page) => updateParams({ page })}
                onPageSizeChange={(limit) => updateParams({ limit, page: 1 })}
              />
            )}
          </CardContent>
        </Card>

        <Card className="sticky top-24 h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC] text-primary">
                {editingTopicId ? <Edit3 className="h-5 w-5" /> : <Tags className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle>{editingTopicId ? "Edit topic" : "Add topic"}</CardTitle>
                <CardDescription>
                  {editingTopicId ? "Update the topic label and description." : "Create a new reusable taxonomy topic."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="topic-name" className="mb-2 block text-sm font-semibold text-primary">
                  Topic name
                </Label>
                <Input
                  id="topic-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  placeholder="e.g. Algebra"
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="topic-description" className="mb-2 block text-sm font-semibold text-primary">
                  Description
                </Label>
                <Textarea
                  id="topic-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  placeholder="Describe what this topic covers."
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
                >
                  {editingTopicId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isPending ? (editingTopicId ? "Saving..." : "Adding...") : (editingTopicId ? "Save topic" : "Add topic")}
                </Button>
                {editingTopicId ? (
                  <Button
                    type="button"
                    onClick={resetForm}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted disabled:opacity-50" variant="secondary"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Modal open={!!previewTopic} onClose={() => setPreviewTopic(null)}>
        {previewTopic && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary">{previewTopic.name}</h2>
            <div className="max-w-full text-sm text-inkd whitespace-normal wrap-break-word">
              {previewTopic.description || "No description provided."}
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Badge variant="info">{getUsageTotal(previewTopic.usage)} mapped</Badge>
              {previewTopic.usage.banks > 0 && <Badge variant="secondary">{previewTopic.usage.banks} banks</Badge>}
              {previewTopic.usage.questions > 0 && <Badge variant="secondary">{previewTopic.usage.questions} questions</Badge>}
              {previewTopic.usage.assessments > 0 && <Badge variant="secondary">{previewTopic.usage.assessments} assessments</Badge>}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setPreviewTopic(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
