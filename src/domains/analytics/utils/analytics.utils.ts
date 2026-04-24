import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";
import type { AnswerEntry } from "@/src/domains/assessment/types/answer-entry.types";
import type { AnswerSheet } from "@/src/domains/assessment/types/answer-sheet.types";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/domains/content/utils/topic-utils";
import type { AssessmentTopicMap, Topic } from "@/src/domains/content/types";
import type {
  AnalyticsAssessmentRow,
  AnalyticsDistributionItem,
  AnalyticsQuestionBreakdown,
  AnalyticsSnapshot,
  AnalyticsSummaryStat,
} from "../types/analytics.types";

function parsePercent(value: string) {
  if (value === "-") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatPercent(value: number | null, fallback: string) {
  return value === null ? fallback : `${Math.round(value)}%`;
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatRatio(numerator: number, denominator: number) {
  if (denominator === 0) {
    return "0";
  }

  return formatDecimal(numerator / denominator);
}

function buildTopicMap(topics: Topic[]) {
  return new Map(topics.map((topic) => [topic.id, topic]));
}

function getAssessmentTopicLabels(
  assessmentId: string,
  assessmentTopics: AssessmentTopicMap[],
  topicMap: Map<string, Topic>,
) {
  return assessmentTopics
    .filter((mapping) => mapping.assessment_id === assessmentId)
    .map((mapping) => topicMap.get(mapping.topic_id)?.name)
    .filter((name): name is string => Boolean(name))
    .sort((left, right) => left.localeCompare(right));
}

function buildAssessmentRows(
  assessments: AssessmentCatalogItem[],
  assessmentTopics: AssessmentTopicMap[],
  topics: Topic[],
): AnalyticsAssessmentRow[] {
  const topicMap = buildTopicMap(topics);

  return assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    topicLabels: getAssessmentTopicLabels(assessment.id, assessmentTopics, topicMap),
    participants: assessment.participant_count,
    questions: assessment.question_count,
    averageScore: parsePercent(assessment.average_score),
    passRate: parsePercent(assessment.pass_rate),
    lifecycle: assessment.lifecycle,
    deliveryMode: assessment.delivery_mode,
  }));
}

function buildQuestionTypeDistribution({
  visibleAssessments,
  answerEntries,
  answerSheets,
}: {
  visibleAssessments: AssessmentCatalogItem[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
}): AnalyticsDistributionItem[] {
  const visibleAssessmentIds = new Set(visibleAssessments.map((assessment) => assessment.id));
  const submittedSheetIds = buildVisibleSubmittedSheetSet(visibleAssessmentIds, answerSheets);
  const typeCounts = new Map<string, number>();
  const seenQuestionIds = new Set<string>();

  answerEntries.forEach((entry) => {
    if (!submittedSheetIds.has(entry.sheet_id) || seenQuestionIds.has(entry.question_id)) {
      return;
    }

    seenQuestionIds.add(entry.question_id);
    const typeLabel = entry.question_snapshot.type_id.replaceAll("_", " ");
    typeCounts.set(typeLabel, (typeCounts.get(typeLabel) ?? 0) + 1);
  });

  const maxCount = Math.max(...typeCounts.values(), 1);

  return [...typeCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, value], index) => ({
      id: label,
      label,
      value,
      helper: `${Math.round((value / maxCount) * 100)}% of the most common question type in this slice`,
      toneClassName:
        index === 0
          ? "bg-primary"
          : index === 1
            ? "bg-secondary"
            : "bg-[color:var(--color-chart-3)]",
    }));
}

function getDifficultyLabel(points: number) {
  if (points <= 6) {
    return "Easy";
  }

  if (points <= 10) {
    return "Medium";
  }

  return "Hard";
}

function buildDifficultyDistribution({
  visibleAssessments,
  answerEntries,
  answerSheets,
}: {
  visibleAssessments: AssessmentCatalogItem[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
}): AnalyticsDistributionItem[] {
  const visibleAssessmentIds = new Set(visibleAssessments.map((assessment) => assessment.id));
  const submittedSheetIds = buildVisibleSubmittedSheetSet(visibleAssessmentIds, answerSheets);
  const difficultyCounts = new Map<string, number>([
    ["Easy", 0],
    ["Medium", 0],
    ["Hard", 0],
  ]);
  const seenQuestionIds = new Set<string>();

  answerEntries.forEach((entry) => {
    if (!submittedSheetIds.has(entry.sheet_id) || seenQuestionIds.has(entry.question_id)) {
      return;
    }

    seenQuestionIds.add(entry.question_id);
    const label = getDifficultyLabel(entry.question_snapshot.points);
    difficultyCounts.set(label, (difficultyCounts.get(label) ?? 0) + 1);
  });

  const maxCount = Math.max(...difficultyCounts.values(), 1);

  return [...difficultyCounts.entries()]
    .sort((left, right) => {
      const order = { Hard: 0, Medium: 1, Easy: 2 };
      return order[left[0] as keyof typeof order] - order[right[0] as keyof typeof order];
    })
    .map(([label, value]) => ({
      id: label,
      label,
      value,
      helper: `${Math.round((value / maxCount) * 100)}% of the largest difficulty bucket in this slice`,
      toneClassName:
        label === "Hard"
          ? "bg-primary"
          : label === "Medium"
            ? "bg-[color:var(--color-chart-2)]"
            : "bg-[color:var(--color-chart-4)]",
    }));
}

function parseResponse(entry: AnswerEntry) {
  try {
    return typeof entry.response === "string"
      ? (JSON.parse(entry.response) as Record<string, unknown>)
      : (entry.response as Record<string, unknown>);
  } catch {
    return null;
  }
}

function getCorrectOptionIds(correctAnswer: unknown) {
  if (typeof correctAnswer === "string") {
    return new Set([correctAnswer]);
  }

  if (Array.isArray(correctAnswer)) {
    return new Set(correctAnswer.filter((value): value is string => typeof value === "string"));
  }

  return new Set<string>();
}

function buildQuestionBreakdown({
  visibleAssessments,
  answerEntries,
  answerSheets,
}: {
  visibleAssessments: AssessmentCatalogItem[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
}): AnalyticsQuestionBreakdown[] {
  const assessmentMap = new Map(visibleAssessments.map((assessment) => [assessment.id, assessment] as const));
  const submittedSheetIds = new Set(
    answerSheets
      .filter(
        (sheet) =>
          sheet.submitted_at != null && assessmentMap.has(sheet.assessment_id),
      )
      .map((sheet) => sheet.id),
  );

  const grouped = new Map<string, AnalyticsQuestionBreakdown>();

  answerEntries.forEach((entry) => {
    if (!submittedSheetIds.has(entry.sheet_id)) {
      return;
    }

    const assessmentId = entry.question_id.split("-question-")[0];
    const assessment = assessmentMap.get(assessmentId);
    const options = entry.question_snapshot.options;

    if (!assessment || !options || options.length === 0) {
      return;
    }

    if (!grouped.has(entry.question_id)) {
      const correctIds = getCorrectOptionIds(entry.question_snapshot.correct_answer);

      grouped.set(entry.question_id, {
        id: entry.question_id,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        questionText: entry.question_snapshot.question_text,
        questionType: entry.question_snapshot.type_id,
        responseCount: 0,
        correctResponseCount: 0,
        optionStats: options.map((option) => ({
          id: option.id,
          label: option.text,
          picks: 0,
          isCorrect: correctIds.has(option.id),
        })),
      });
    }

    const question = grouped.get(entry.question_id);

    if (!question) {
      return;
    }

    const response = parseResponse(entry);
    if (!response) {
      return;
    }

    question.responseCount += 1;
    if (entry.is_correct === true) {
      question.correctResponseCount += 1;
    }

    const singleOptionId =
      typeof response.selected_option_id === "string" ? response.selected_option_id : null;
    const multipleOptionIds = Array.isArray(response.selected_option_ids)
      ? response.selected_option_ids.filter((value): value is string => typeof value === "string")
      : [];
    const selectedIds = new Set(
      singleOptionId ? [singleOptionId, ...multipleOptionIds] : multipleOptionIds,
    );

    question.optionStats = question.optionStats.map((option) =>
      selectedIds.has(option.id)
        ? { ...option, picks: option.picks + 1 }
        : option,
    );
  });

  return [...grouped.values()]
    .sort((left, right) => right.responseCount - left.responseCount)
    .slice(0, 6);
}

function buildVisibleSubmittedSheetSet(
  visibleAssessmentIds: Set<string>,
  answerSheets: AnswerSheet[],
) {
  return new Set(
    answerSheets
      .filter(
        (sheet) =>
          visibleAssessmentIds.has(sheet.assessment_id) && sheet.submitted_at != null,
      )
      .map((sheet) => sheet.id),
  );
}

export function buildAnalyticsSnapshot({
  assessments,
  assessmentTopics,
  topics,
  answerEntries,
  answerSheets,
  selectedAssessmentId,
  selectedTopic,
}: {
  assessments: AssessmentCatalogItem[];
  assessmentTopics: AssessmentTopicMap[];
  topics: Topic[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
  selectedAssessmentId: string;
  selectedTopic: string;
}): AnalyticsSnapshot {
  const topicMap = buildTopicMap(topics);
  const selectedTopicLabel =
    selectedTopic === ALL_TOPICS_VALUE
      ? "All topics"
      : topicMap.get(selectedTopic)?.name ?? "Unknown topic";

  const topicScopedAssessments = assessments.filter((assessment) =>
    selectedTopic === ALL_TOPICS_VALUE
      ? true
      : assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics),
  );

  const visibleAssessments =
    selectedAssessmentId === "all-assessments"
      ? topicScopedAssessments
      : topicScopedAssessments.filter((assessment) => assessment.id === selectedAssessmentId);

  const rows = buildAssessmentRows(visibleAssessments, assessmentTopics, topics).sort(
    (left, right) => right.participants - left.participants,
  );
  const visibleAssessmentIds = new Set(visibleAssessments.map((assessment) => assessment.id));
  const submittedSheetIds = buildVisibleSubmittedSheetSet(visibleAssessmentIds, answerSheets);
  const participantTotal = rows.reduce((sum, row) => sum + row.participants, 0);
  const objectiveEntries = answerEntries.filter(
    (entry) =>
      submittedSheetIds.has(entry.sheet_id) &&
      Array.isArray(entry.question_snapshot.options) &&
      entry.question_snapshot.options.length > 0 &&
      entry.is_correct !== null,
  );
  const objectiveCorrectCount = objectiveEntries.filter((entry) => entry.is_correct === true).length;
  const activeAssessmentCount = rows.filter((row) => row.lifecycle === "ACTIVE").length;
  const realTimeAssessmentCount = rows.filter((row) => row.deliveryMode === "REAL_TIME").length;
  const submissionCoverage =
    participantTotal > 0 ? Math.round((submittedSheetIds.size / participantTotal) * 100) : 0;
  const objectiveAccuracy =
    objectiveEntries.length > 0
      ? Math.round((objectiveCorrectCount / objectiveEntries.length) * 100)
      : null;

  const summary: AnalyticsSummaryStat[] = [
    {
      id: "submission-coverage",
      label: "Submission coverage",
      value: `${submissionCoverage}%`,
      helper: `${submittedSheetIds.size} submitted sheets across ${participantTotal.toLocaleString()} tracked participants.`,
    },
    {
      id: "participant-density",
      label: "Participants per assessment",
      value: formatRatio(participantTotal, rows.length),
      helper:
        rows.length === 0
          ? "No assessments are visible in the current slice."
          : `${participantTotal.toLocaleString()} participants spread across ${rows.length} assessments.`,
    },
    {
      id: "objective-accuracy",
      label: "Objective question accuracy",
      value: formatPercent(objectiveAccuracy, "-"),
      helper:
        objectiveEntries.length === 0
          ? "No option-based responses are available in the current slice."
          : `${objectiveCorrectCount} correct responses across ${objectiveEntries.length} graded option selections.`,
    },
    {
      id: "delivery-health",
      label: "Active / real-time mix",
      value: `${activeAssessmentCount} / ${realTimeAssessmentCount}`,
      helper: `${selectedTopicLabel} currently shows ${rows.length} visible assessments in scope.`,
    },
  ];

  return {
    summary,
    questionTypeDistribution: buildQuestionTypeDistribution({
      visibleAssessments,
      answerEntries,
      answerSheets,
    }),
    difficultyDistribution: buildDifficultyDistribution({
      visibleAssessments,
      answerEntries,
      answerSheets,
    }),
    questionBreakdown: buildQuestionBreakdown({
      visibleAssessments,
      answerEntries,
      answerSheets,
    }),
    assessmentRows: rows,
    selectedTopicLabel,
  };
}
