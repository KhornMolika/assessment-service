"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { Edit3, Plus, Save, Search, Tags, Trash2, X } from "lucide-react";
import type { Topic } from "@/src/types";
import { Badge } from "@/src/components/ui/ui/badge";
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
import { createTopicAction, updateTopicAction, deleteTopicAction } from "../../actions/topic.actions";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";

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
}: {
  topics: EditableTopic[];
}) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<TopicFormState>(emptyForm);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return topics;
    }

    return topics.filter((topic) =>
      [topic.name, topic.description, topic.id].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [topics, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTopicId(null);
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Topic name is required.");
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
        setError(res.error || "Failed to save topic");
      } else {
        resetForm();
      }
    });
  };

  const handleEdit = (topic: EditableTopic) => {
    setEditingTopicId(topic.id);
    setForm({
      name: topic.name,
      description: topic.description,
    });
    setError("");
  };

  const handleDelete = (topic: EditableTopic) => {
    const usageTotal = getUsageTotal(topic.usage);

    if (usageTotal > 0) {
      setError("Only unused topics can be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the topic "${topic.name}"?`)) return;

    startTransition(async () => {
      const res = await deleteTopicAction(topic.id);
      if (!res.success) {
        setError(res.error || "Failed to delete topic");
      } else {
        if (editingTopicId === topic.id) {
          resetForm();
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Topic library</CardTitle>
              <CardDescription>
                Manage the taxonomy used by banks, questions, assessments, and the global topic filter.
              </CardDescription>
            </div>
            <Label className="relative block w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkl" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search topics..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </Label>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-0 sm:pb-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Topic</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => {
                  const usageTotal = getUsageTotal(topic.usage);

                  return (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div className="font-semibold text-primary">{topic.name}</div>
                        <div className="mt-1 max-w-xl text-sm text-inkd">
                          {topic.description || "No description provided."}
                        </div>
                        <div className="mt-2 text-xs text-inkd">{topic.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={usageTotal > 0 ? "info" : "secondary"}>
                            {usageTotal} mapped
                          </Badge>
                          <Badge variant="secondary">{topic.usage.banks} banks</Badge>
                          <Badge variant="secondary">{topic.usage.questions} questions</Badge>
                          <Badge variant="secondary">{topic.usage.assessments} assessments</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-inkd">
                        {formatDate(topic.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(topic)}
                            disabled={isPending}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-inkd transition hover:bg-muted hover:text-primary disabled:opacity-50"
                            aria-label={`Edit ${topic.name}`} variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(topic)}
                            disabled={usageTotal > 0 || isPending}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${topic.name}`} variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
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
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  placeholder="Describe what this topic covers."
                  disabled={isPending}
                />
              </div>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
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
    </div>
  );
}
