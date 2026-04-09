import { Calendar, FileText, Globe, Tag, Users } from "lucide-react";
import type { Bank } from "@/src/domains/content/types";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityLabel(visibility: Bank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "ORG":
      return "Organization";
    default:
      return "Private";
  }
}

function renderVisibilityIcon(visibility: Bank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return <Globe className="h-5 w-5 text-inkd/70" />;
    case "ORG":
      return <Users className="h-5 w-5 text-inkd/70" />;
    default:
      return <Calendar className="h-5 w-5 text-inkd/70" />;
  }
}

export default function QuestionBankDetailStats({ bank }: { bank: Bank }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl bg-primary p-6 text-white">
        <div className="mb-3 flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/70">Questions</div>
          <FileText className="h-5 w-5 text-white/50" />
        </div>
        <div className="mb-2 text-4xl font-bold">{bank.question_count}</div>
        <p className="text-xs text-white/70">Reusable items currently associated with this bank.</p>
      </div>

      <div className="rounded-2xl bg-[#D8F3DC] p-6">
        <div className="mb-3 flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-inkd">Tags</div>
          <Tag className="h-5 w-5 text-inkd/70" />
        </div>
        <div className="mb-2 text-4xl font-bold text-primary">{bank.tags.length}</div>
        <p className="text-xs text-inkd">Taxonomy labels available for filtering and reuse.</p>
      </div>

      <div className="rounded-2xl bg-[#FFF4E6] p-6">
        <div className="mb-3 flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-inkd">Created</div>
          <Calendar className="h-5 w-5 text-inkd/70" />
        </div>
        <div className="mb-2 text-2xl font-bold text-primary">{formatDate(bank.created_at)}</div>
        <p className="text-xs text-inkd">Original creation date for this question bank.</p>
      </div>

      <div className="rounded-2xl bg-[#E7F0FF] p-6">
        <div className="mb-3 flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-inkd">Visibility</div>
          {renderVisibilityIcon(bank.visibility)}
        </div>
        <div className="mb-2 text-2xl font-bold text-primary">{getVisibilityLabel(bank.visibility)}</div>
        <p className="text-xs text-inkd">Controls who can discover and reuse this bank.</p>
      </div>
    </div>
  );
}
