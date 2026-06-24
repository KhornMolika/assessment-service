import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Settings2, 
  Users, 
  Hash, 
  Target,
  RefreshCw,
  Eye,
  CheckCircle2,
  ListFilter,
  Type,
  AlignLeft
} from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/types/assessment-detail.types";

export default function AssessmentDetailInformationCard({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const createdDate = assessment.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const updatedDate = assessment.updatedAt
    ? new Date(assessment.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
    
  const actualStartsAt = assessment.settings?.startsAt || assessment.starts_at;
  const startsAtDate = actualStartsAt
    ? new Date(actualStartsAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Not Set";
    
  const endsAtDate = assessment.settings?.endsAt
    ? new Date(assessment.settings.endsAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Not Set";

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PUBLISHED": return "text-emerald-600";
      case "DRAFT": return "text-slate-500";
      case "ARCHIVED": return "text-red-500";
      default: return "text-slate-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Assessment Details Card */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-indigo-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Name</div>
              <div className="text-sm font-medium text-slate-900">
                {assessment.name || assessment.title || "Untitled"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlignLeft className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-slate-500">Description</div>
              <div className="text-sm font-medium text-slate-900 line-clamp-3">
                {assessment.description || assessment.subtitle || "No description provided."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle2 className={`h-5 w-5 ${getStatusColor(assessment.status)}`} />
            <div>
              <div className="text-xs font-medium text-slate-500">Status</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.status?.toLowerCase() || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Type</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.type?.toLowerCase() || "Quiz"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div>
              <div className="text-xs font-medium text-slate-500">Created At</div>
              <div className="text-sm font-medium text-slate-900">{createdDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-slate-400" />
            <div>
              <div className="text-xs font-medium text-slate-500">Updated At</div>
              <div className="text-sm font-medium text-slate-900">{updatedDate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card className="md:col-span-2 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
          <div className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-indigo-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Delivery Mode</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.settings?.mode?.replace("_", " ").toLowerCase() || "Self Paced"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ListFilter className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Question Selection</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.settings?.questionSelection?.toLowerCase() || "Manual"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Participant Identity</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.settings?.participantIdentity?.toLowerCase() || "Internal"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Fixed Questions Count</div>
              <div className="text-sm font-medium text-slate-900">
                {assessment.settings?.numQuestions || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-400" />
            <div>
              <div className="text-xs font-medium text-slate-500">Time Limit</div>
              <div className="text-sm font-medium text-slate-900">
                {assessment.settings?.timeLimit ? `${assessment.settings.timeLimit} minutes` : "No Limit"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Starts At</div>
              <div className="text-sm font-medium text-slate-900">{startsAtDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-rose-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Ends At</div>
              <div className="text-sm font-medium text-slate-900">{endsAtDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-teal-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Pass Mark</div>
              <div className="text-sm font-medium text-slate-900">
                {assessment.settings?.passMark || 0}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-cyan-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Shuffle Questions</div>
              <div className="text-sm font-medium text-slate-900">
                {assessment.settings?.isShuffle ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-sky-500" />
            <div>
              <div className="text-xs font-medium text-slate-500">Show Results</div>
              <div className="text-sm font-medium text-slate-900 capitalize">
                {assessment.settings?.showResults?.toLowerCase() || "Never"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
