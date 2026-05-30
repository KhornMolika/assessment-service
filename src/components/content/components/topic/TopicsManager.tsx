"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save, Search, Tags, Trash2, X } from "lucide-react";
import type { Topic } from "@/src/types";
import {
  readManagedTopicsFromStorage,
  TOPICS_STORAGE_KEY,
  TOPICS_UPDATED_EVENT,
} from "@/src/components/content/utils/topic-storage";
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

function buildTopicId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `topic-${slug || Date.now()}`;
}

function readStoredTopics(initialTopics: EditableTopic[]) {
  if (typeof window === "undefined") {
    return initialTopics;
  }

  if (window.localStorage.getItem(TOPICS_STORAGE_KEY) == null) {
    return initialTopics;
  }

  const storedTopics = readManagedTopicsFromStorage();
  return storedTopics as EditableTopic[];
}

function writeStoredTopics(topics: EditableTopic[]) {
  window.localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
  window.dispatchEvent(new CustomEvent(TOPICS_UPDATED_EVENT, { detail: topics }));
}

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
  const [managedTopics, setManagedTopics] = useState(topics);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<TopicFormState>(emptyForm);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setManagedTopics(readStoredTopics(topics));
  }, [topics]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return managedTopics;
    }

    return managedTopics.filter((topic) =>
      [topic.name, topic.description, topic.id].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [managedTopics, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTopicId(null);
    setError("");
  };

  const saveTopics = (nextTopics: EditableTopic[]) => {
    setManagedTopics(nextTopics);
    writeStoredTopics(nextTopics);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Topic name is required.");
      return;
    }

    const duplicate = managedTopics.some(
      (topic) =>
        topic.name.toLowerCase() === name.toLowerCase() &&
        topic.id !== editingTopicId,
    );

    if (duplicate) {
      setError("A topic with this name already exists.");
      return;
    }

    if (editingTopicId) {
      saveTopics(
        managedTopics.map((topic) =>
          topic.id === editingTopicId
            ? {
                ...topic,
                name,
                description,
              }
            : topic,
        ),
      );
      resetForm();
      return;
    }

    const nextTopic: EditableTopic = {
      id: buildTopicId(name),
      name,
      description,
      created_at: new Date().toISOString(),
      usage: {
        banks: 0,
        questions: 0,
        assessments: 0,
      },
    };

    saveTopics([nextTopic, ...managedTopics]);
    resetForm();
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
      setError("Only unused topics can be deleted in this mock workspace.");
      return;
    }

    saveTopics(managedTopics.filter((item) => item.id !== topic.id));
    if (editingTopicId === topic.id) {
      resetForm();
    }
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
            <label className="relative block w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkl" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search topics..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </label>
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
                          <button
                            onClick={() => handleEdit(topic)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-inkd transition hover:bg-muted hover:text-primary"
                            aria-label={`Edit ${topic.name}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(topic)}
                            disabled={usageTotal > 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${topic.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
                <label htmlFor="topic-name" className="mb-2 block text-sm font-semibold text-primary">
                  Topic name
                </label>
                <input
                  id="topic-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  placeholder="e.g. Algebra"
                />
              </div>
              <div>
                <label htmlFor="topic-description" className="mb-2 block text-sm font-semibold text-primary">
                  Description
                </label>
                <textarea
                  id="topic-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  placeholder="Describe what this topic covers."
                />
              </div>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingTopicId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingTopicId ? "Save topic" : "Add topic"}
                </button>
                {editingTopicId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
