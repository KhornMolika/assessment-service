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
import { Edit2, Trash2, Eye, Copy, MoreHorizontal, Plus } from "lucide-react";
import { ActionMenu } from "@/src/components/ui/ui/action-menu";
import { useTranslations } from "next-intl";

export function TopicsClient({ initialTopics }: { initialTopics: Topic[] }) {
  const t = useTranslations("Topics");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setTopics, activeTopic, setActiveTopic } = useTopicStore();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const itemsPerPage = Number(searchParams.get("pageSize") || "10");

  const [topics, setLocalTopics] = useState<Topic[]>(initialTopics);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      toast.error(t("refreshFail"));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newTopic = await createTopic(formData);
      toast.success(t("createSuccess"));
      setFormData({ name: "", description: "" });
      setActiveTopic(newTopic);
      setIsCreateModalOpen(false);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || t("createFail"));
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
      toast.success(t("updateSuccess"));
      setIsEditModalOpen(false);
      setEditingTopic(null);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || t("updateFail"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createTopic(duplicateFormData);
      toast.success(t("duplicateSuccess"));
      setIsDuplicateModalOpen(false);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || t("duplicateFail"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopicId) return;
    setIsSaving(true);
    try {
      await deleteTopic(deletingTopicId);
      toast.success(t("deleteSuccess"));
      if (activeTopic?.id === deletingTopicId) {
        setActiveTopic(null);
      }
      setIsDeleteModalOpen(false);
      setDeletingTopicId(null);
      await refreshTopics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || t("deleteFail"));
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
        className="catalog-header"
        title={t("title")}
        description={t("description", { total: topics.length })}
        actions={
          <Btn onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("createTitle") || "New Topic"}
          </Btn>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1 space-y-6">
          <Card className="overflow-hidden flex flex-col">
            <CH className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CT>{t("listTitle")}</CT>
                <CD>{t("listDesc")}</CD>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Btn onClick={() => setIsCreateModalOpen(true)} className="embed-only-element inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("createTitle") || "New Topic"}
                </Btn>
              </div>
            </CH>
            <CB className="px-0 pb-0 flex-1">
              {topics.length === 0 ? (
                <div className="py-12 text-center border-t border-border">
                  <p className="text-slate-500">{t("noTopics")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("descriptionLabel")}</TableHead>
                      <TableHead>{t("created")}</TableHead>
                      <TableHead className="w-25 text-right">{t("actions")}</TableHead>
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
                          <div className="flex items-center justify-end">
                            <ActionMenu>
                              <button onClick={() => openPreviewModal(topic)} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left font-medium hover:bg-muted transition-colors">
                                <Eye className="h-4 w-4 text-blue-600" />
                                {t("view")}
                              </button>
                              <button onClick={() => openEditModal(topic)} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left font-medium hover:bg-muted transition-colors">
                                <Edit2 className="h-4 w-4 text-emerald-600" />
                                {t("edit")}
                              </button>
                              <button onClick={() => openDuplicateModal(topic)} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left font-medium hover:bg-muted transition-colors">
                                <Copy className="h-4 w-4 text-primary" />
                                {t("duplicate")}
                              </button>
                              <button onClick={() => openDeleteModal(topic.id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left font-medium hover:bg-red-50 text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                                {t("delete")}
                              </button>
                            </ActionMenu>
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
      </div>

      {/* Create Modal */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-4">{t("createTitle")}</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("namePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t("descPlaceholder")} rows={3} />
            </div>
            <div className="pt-2">
              <Btn type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? t("creatingBtn") : t("createBtn")}
              </Btn>
            </div>
          </form>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)}>
        {previewTopic && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b pb-4">{t("detailsTitle")}</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("name")}</Label>
                <div className="mt-1 text-base font-medium text-slate-900">{previewTopic.name}</div>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("descriptionLabel")}</Label>
                <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-20">
                  {previewTopic.description || <span className="italic text-slate-400">{t("noDesc")}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("created")}</Label>
                  <div className="mt-1 text-sm text-slate-700">{new Date(previewTopic.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("status")}</Label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t("active")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Btn onClick={() => setIsPreviewModalOpen(false)}>{t("close")}</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{t("editTitle")}</h2>
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("nameLabel")}</Label>
            <Input id="edit-name" required value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t("descriptionLabel")}</Label>
            <Textarea id="edit-description" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Btn type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>{t("cancel")}</Btn>
            <Btn type="submit" disabled={isSaving}>{isSaving ? t("saving") : t("save")}</Btn>
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
        title={t("deleteTitle")}
        entityName={deletingTopic?.name || ""}
        description={t("deleteDesc")}
        isPending={isSaving}
      />

      {/* Duplicate Modal */}
      <Modal open={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)}>
        <form onSubmit={handleDuplicateSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{t("duplicateTitle")}</h2>
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">{t("nameLabel")}</Label>
            <Input id="duplicate-name" required value={duplicateFormData.name} onChange={(e) => setDuplicateFormData({ ...duplicateFormData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duplicate-description">{t("descriptionLabel")}</Label>
            <Textarea id="duplicate-description" value={duplicateFormData.description} onChange={(e) => setDuplicateFormData({ ...duplicateFormData, description: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Btn type="button" variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>{t("cancel")}</Btn>
            <Btn type="submit" disabled={isSaving}>{isSaving ? t("saving") : t("duplicateBtn")}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
