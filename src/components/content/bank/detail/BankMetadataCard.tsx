import type { QuestionBank } from "@/src/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityLabel(visibility: QuestionBank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "SHARED":
      return "Organization";
    default:
      return "Private";
  }
}

import { FolderOpen, Eye, Clock, Hash, AlignLeft, Tag } from "lucide-react";

export default function BankMetadataCard({ bank }: { bank: QuestionBank }) {
  const createdDate = new Date(bank.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-indigo-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Name</div>
            <div className="text-sm font-medium text-slate-900">{bank.name}</div>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3">
          <AlignLeft className="h-5 w-5 text-emerald-500 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-500">Description</div>
            <div className="text-sm font-medium text-slate-900 line-clamp-3">
              {bank.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Question Count */}
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Questions</div>
            <div className="text-sm font-medium text-slate-900">{bank.questionCount || 0}</div>
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-purple-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Visibility</div>
            <div className="text-sm font-medium text-slate-900">{getVisibilityLabel(bank.visibility)}</div>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Created At</div>
            <div className="text-sm font-medium text-slate-900">{createdDate}</div>
          </div>
        </div>

        {/* Tags */}
        {bank.tags && bank.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-indigo-500 mt-0.5" />
            <div className="w-full">
              <div className="text-xs font-medium text-slate-500 mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {bank.tags.map((tag) => (
                  <span
                    key={`${bank.id}-${tag}`}
                    className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 border border-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
