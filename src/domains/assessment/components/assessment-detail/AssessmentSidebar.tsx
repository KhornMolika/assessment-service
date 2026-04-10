import { BarChart3 } from "lucide-react";
import type {
  AssessmentDetailActivityItem,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import AssessmentDetailActions from "./AssessmentDetailActions";

function ProgressOverview({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const completionRate =
    assessment.participant_count === 0
      ? 0
      : Math.round((assessment.completed_count / assessment.participant_count) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-inkd">Completion Rate</span>
            <span className="text-sm font-bold text-primary">{completionRate}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-inkd">Completed</span>
            </div>
            <span className="font-bold text-primary">{assessment.completed_count}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-inkd">In Progress</span>
            </div>
            <span className="font-bold text-primary">{assessment.in_progress_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceStats({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const stats = [
    { label: "Average Score", value: `${assessment.average_score_percent}%` },
    { label: "Pass Rate", value: `${assessment.pass_rate_percent}%` },
    { label: "Active Sessions", value: `${assessment.active_sessions}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-muted p-4">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-inkd">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity({
  items,
}: {
  items: AssessmentDetailActivityItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((activity, index) => (
          <div
            key={`${activity.name}-${index}`}
            className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accp text-sm font-bold text-primary">
              {activity.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-primary">{activity.name}</div>
              <div className="text-xs text-inkd">
                {activity.action === "completed"
                  ? `Completed${activity.score !== null ? ` · Score: ${activity.score}%` : ""}`
                  : "Started the assessment"}
              </div>
              <div className="mt-1 text-xs text-inkd">{activity.time}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActions({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AssessmentDetailActions assessment={assessment} />
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          Export Results
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-pl">
          <BarChart3 className="h-4 w-4" />
          View Full Report
        </button>
      </CardContent>
    </Card>
  );
}

export default function AssessmentSidebar({
  assessment,
  recentActivity,
}: {
  assessment: AssessmentDetailRecord;
  recentActivity: AssessmentDetailActivityItem[];
}) {
  return (
    <div className="space-y-6">
      <QuickActions assessment={assessment} />
      <ProgressOverview assessment={assessment} />
      <PerformanceStats assessment={assessment} />
      <RecentActivity items={recentActivity} />
    </div>
  );
}
