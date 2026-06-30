"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topic, useTopicStore } from "@/src/stores/topic-store";
import { createTopic, deleteTopic, fetchTopics, updateTopic } from "@/src/actions/topic-actions";
import { Card, CardHeader as CH, CardTitle as CT, CardContent as CB, CardDescription as CD } from "@/src/components/ui/ui/card";
import { Button as Btn } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { Label } from "@/src/components/ui/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/ui/table";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import Pagination from "@/src/components/ui/navigation/Pagination";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";
import { toast } from "sonner";
import { Edit2, Trash2, Eye, Copy } from "lucide-react";

export function TopicsClient({ initialTopics }: { initialTopics: Topic[] }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setTopics, activeTopic, setActiveTopic } = useTopicStore();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const itemsPerPage = Number(searchParams.get("pageSize") || "10");

  const [topics, setLocalTopics] = useState<Topic[]>(initialTopics);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });
  const [duplicateFormData, setDuplicateFormData] = useState({ name: "", description: "" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    useTopicStore.getState().setTopics(initialTopics);
  }, [initialTopics]);

  const refreshTopics = async () => {
    try {
      const freshTopics = await fetchTopics();
      setLocalTopics(freshTopics);
      useTopicStore.getState().setTopics(freshTopics);
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh topics.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newTopic = await createTopic(formData);
      toast.success("Topic created successfully");
      setFormData({ name: "", description: "" });
      setActiveTopic(newTopic);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to create topic");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    setIsSaving(true);
    try {
      await updateTopic(editingTopic.id, editFormData);
      toast.success("Topic updated successfully");
      setIsEditModalOpen(false);
      setEditingTopic(null);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update topic");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createTopic(duplicateFormData);
      toast.success("Topic duplicated successfully");
      setIsDuplicateModalOpen(false);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate topic");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopicId) return;
    setIsSaving(true);
    try {
      await deleteTopic(deletingTopicId);
      toast.success("Topic deleted successfully");
      if (activeTopic?.id === deletingTopicId) {
        setActiveTopic(null);
      }
      setIsDeleteModalOpen(false);
      setDeletingTopicId(null);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to delete topic");
    } finally {
      setIsSaving(false);
    }
  };

  const openPreviewModal = (topic: Topic) => {
    setPreviewTopic(topic);
    setIsPreviewModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setEditFormData({ name: topic.name, description: topic.description || "" });
    setIsEditModalOpen(true);
  };

  const openDuplicateModal = (topic: Topic) => {
    setDuplicateFormData({ name: `${topic.name} (Copy)`, description: topic.description || "" });
    setIsDuplicateModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingTopicId(id);
    setDeleteConfirmation("");
    setIsDeleteModalOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(topics.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedTopics = topics.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );
  
  const deletingTopic = topics.find(t => t.id === deletingTopicId);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Topics"
        description="Manage and organize your assessment topics."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden flex flex-col">
            <CH className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CT>Topics List</CT>
                <CD>All available topics in the workspace.</CD>
              </div>
            </CH>
            <CB className="px-0 pb-0 flex-1">
              {topics.length === 0 ? (
                <div className="py-12 text-center border-t border-border">
                  <p className="text-slate-500">No topics found. Create your first topic to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-25 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.name}</TableCell>
                        <TableCell className="text-inkd truncate max-w-50">{topic.description || "—"}</TableCell>
                        <TableCell className="text-inkd whitespace-nowrap">
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Btn 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openPreviewModal(topic)} 
                              title="View topic"
                              className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Btn>
                            <Btn 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditModal(topic)} 
                              title="Edit topic"
                              className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </Btn>
                            <Btn 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDuplicateModal(topic)} 
                              title="Duplicate topic"
                              className="h-8 w-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                              <Copy className="h-4.5 w-4.5" />
                            </Btn>
                            <Btn 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDeleteModal(topic.id)} 
                              title="Delete topic"
                              className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Btn>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CB>
            {topics.length > 0 && (
              <Pagination
                pathname="/topics"
                searchParams={{
                  pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
                }}
                currentPage={activePage}
                totalPages={totalPages}
                pageSize={itemsPerPage}
                defaultPageSize={10}
                totalItems={topics.length}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="topics"
              />
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CH>
              <CT>Create New Topic</CT>
              <CD>Add a new topic category for questions and assessments.</CD>
            </CH>
            <CB>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description..." rows={3} />
                </div>
                <div className="pt-2">
                  <Btn type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Creating..." : "Create Topic"}
                  </Btn>
                </div>
              </form>
            </CB>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)}>
        {previewTopic && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b pb-4">Topic Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</Label>
                <div className="mt-1 text-base font-medium text-slate-900">{previewTopic.name}</div>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-20">
                  {previewTopic.description || <span className="italic text-slate-400">No description provided</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Created</Label>
                  <div className="mt-1 text-sm text-slate-700">{new Date(previewTopic.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Btn onClick={() => setIsPreviewModalOpen(false)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Edit Topic</h2>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input id="edit-name" required value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Btn type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Btn>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirmation("");
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        entityName={deletingTopic?.name || ""}
        description="Warning: If you delete this topic, all child resources (Questions, Question Banks, and Assessments) will be deleted too. This action cannot be undone."
        isPending={isSaving}
      />

      {/* Duplicate Modal */}
      <Modal open={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)}>
        <form onSubmit={handleDuplicateSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Duplicate Topic</h2>
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">Name *</Label>
            <Input id="duplicate-name" required value={duplicateFormData.name} onChange={(e) => setDuplicateFormData({ ...duplicateFormData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duplicate-description">Description</Label>
            <Textarea id="duplicate-description" value={duplicateFormData.description} onChange={(e) => setDuplicateFormData({ ...duplicateFormData, description: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Btn type="button" variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Duplicate Topic"}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
